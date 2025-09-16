import { createSubscriber } from 'svelte/reactivity';
import { equal } from '@wry/equality';
import type { 
	ApolloClient, 
	DocumentNode, 
	OperationVariables,
	TypedDocumentNode,
	ApolloCache,
	ErrorPolicy,
	MutationFetchPolicy,
	MutationUpdaterFunction,
	InternalRefetchQueriesInclude,
	NormalizedExecutionResult,
	OnQueryUpdated,
	MutationQueryReducersMap,
	DefaultContext,
	ErrorLike,
	MaybeMasked,
	Unmasked
} from '@apollo/client';
import type { IgnoreModifier } from '@apollo/client/cache';

import { ApolloClientContext } from '../../provider/context.js';

type NoInfer<T> = [T][T extends any ? 0 : never];

interface MutationState<TData = any> {
	data: MaybeMasked<TData> | null | undefined;
	loading: boolean;
	error: ErrorLike | undefined;
	called: boolean;
}

export interface MutationOptions<TData = any, TVariables extends OperationVariables = OperationVariables, TCache extends ApolloCache = ApolloCache> {
	/** Optimistic response for the mutation */
	optimisticResponse?: 
		| Unmasked<NoInfer<TData>>
		| ((vars: TVariables, { IGNORE }: { IGNORE: IgnoreModifier }) => Unmasked<NoInfer<TData>> | IgnoreModifier);

	/** Update queries after mutation */
	updateQueries?: MutationQueryReducersMap<TData>;

	/** Refetch queries after mutation */
	refetchQueries?: 
		| ((result: NormalizedExecutionResult<Unmasked<TData>>) => InternalRefetchQueriesInclude)
		| InternalRefetchQueriesInclude;

	/** Whether to await refetch queries */
	awaitRefetchQueries?: boolean;

	/** Update function for the cache */
	update?: MutationUpdaterFunction<TData, TVariables, TCache>;

	/** On query updated callback */
	onQueryUpdated?: OnQueryUpdated<any>;

	/** Error policy */
	errorPolicy?: ErrorPolicy;

	/** Default variables */
	variables?: Partial<TVariables>;

	/** Context for the mutation */
	context?: DefaultContext;

	/** Fetch policy */
	fetchPolicy?: MutationFetchPolicy;

	/** Keep root fields */
	keepRootFields?: boolean;

	/** Apollo client instance */
	client?: ApolloClient;

	/** Notify on network status change */
	notifyOnNetworkStatusChange?: boolean;

	/** On completed callback */
	onCompleted?: (data: MaybeMasked<TData>, clientOptions?: MutationOptions<TData, TVariables, TCache>) => void;

	/** On error callback */
	onError?: (error: ErrorLike, clientOptions?: MutationOptions<TData, TVariables, TCache>) => void;
}

export class Mutation<TData = any, TVariables extends OperationVariables = OperationVariables, TCache extends ApolloCache = ApolloCache> {
	private apolloClient: ApolloClient;
	private mutation: DocumentNode | TypedDocumentNode<TData, TVariables>;
	private options: MutationOptions<TData, TVariables, TCache>;
	private mutationId = 0;
	private isMounted = false;

	// Internal state
	private _next = () => {};
	private _unsubscribe = () => {};
	private _subscribe: () => void;
	private _state: MutationState<TData>;

	constructor(
		mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
		options: Partial<MutationOptions<TData, TVariables, TCache>> = {}
	) {
		this.isMounted = true;
		this.apolloClient = options?.client || ApolloClientContext.get();
		this.mutation = mutation;
		this.options = options as MutationOptions<TData, TVariables, TCache>;

		this._state = this.createInitialState();

		this._subscribe = createSubscriber((update) => {
			this._next = update;
			return () => this._unsubscribe();
		});
	}

	private createInitialState(): MutationState<TData> {
		return {
			data: undefined,
			error: undefined,
			called: false,
			loading: false
		};
	}

	private updateState(newState: MutationState<TData>) {
		const prevState = this._state;
		this._state = newState;
		
		if (!equal(prevState, this._state)) {
			this._next();
		}
	}

	async mutate(
		variables?: TVariables, 
		mutationOptions?: Partial<MutationOptions<TData, TVariables, TCache>>
	): Promise<ApolloClient.MutateResult<MaybeMasked<TData>>> {

		this._unsubscribe = () => {
			this.isMounted = false;
			this._unsubscribe();
		}

		if (!this._state.loading && this.isMounted) {
			this.updateState({
				loading: true,
				error: undefined,
				data: undefined,
				called: true
			});
		}

		const mutationId = ++this.mutationId;
		const baseOptions = { ...this.options, mutation: this.mutation };
		const client = mutationOptions?.client || this.apolloClient;
		const clientOptions = { ...baseOptions, ...mutationOptions, variables };

		try {
			const response = await client.mutate<TData, TVariables>(clientOptions as any);
			const { data, error } = response;

			// Handle error callback
			const onError = mutationOptions?.onError || this.options?.onError;
			if (error && onError) {
				onError(error, clientOptions);
			}

			// Update state if this is the latest mutation
			if (mutationId === this.mutationId && this.isMounted) {
				const result = {
					called: true,
					loading: false,
					data,
					error
				};

				this.updateState(result);
			}

			// Handle completed callback
			const onCompleted = mutationOptions?.onCompleted || this.options?.onCompleted;
			if (!error && onCompleted) {
				onCompleted(response.data!, clientOptions);
			}

			return response;
		} catch (error) {
			console.log(error);
			// Update state on error if this is the latest mutation
			if (mutationId === this.mutationId && this.isMounted) {
				const result = {
					loading: false,
					error: error as ErrorLike,
					data: undefined,
					called: true
				};

				this.updateState(result);
			}

			// Handle error callback
			const onError = mutationOptions?.onError || this.options?.onError;
			if (onError) {
				onError(error as ErrorLike, clientOptions);
			}

			throw error;
		}
	}

	reset() {
		if (this.isMounted) {
			const result = this.createInitialState();
			this.mutationId = 0;
			this.updateState(result);
		}
	}

	// Getters for reactive state
	get data() {
		this._subscribe();
		return this._state.data;
	}

	get loading() {
		this._subscribe();
		return this._state.loading;
	}

	get error() {
		this._subscribe();
		return this._state.error;
	}

	get called() {
		this._subscribe();
		return this._state.called;
	}

	get client() {
		this._subscribe();
		return this.apolloClient;
	}
}
