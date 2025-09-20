import { createSubscriber } from 'svelte/reactivity';
import { type ApolloClient, type DocumentNode, type ObservableQuery, type UpdateQueryMapFn, type OperationVariables, type TypedDocumentNode, type NetworkStatus, type ErrorLike } from '@apollo/client/core';
import type { DeepPartial } from '@apollo/client/utilities';
import { observeOn, asapScheduler } from 'rxjs'

import { ApolloClientContext } from '../../provider/context.js';

export type QueryOptions<TData, TVariables extends OperationVariables> = Partial<
	Omit<ApolloClient.WatchQueryOptions<TData, TVariables>, 'query'> & {
		client: ApolloClient;
		initialData?: TData; 
		lazy?: boolean
	}
>;

// Base query class without execute method
class BaseQuery<TData = any, TVariables extends OperationVariables = OperationVariables> {
	// Attributes
	client: ApolloClient;
	observable!: ObservableQuery<TData, TVariables>;
	previousData?: TData | DeepPartial<TData> | undefined = undefined;

	// Methods
	refetch!: (variables?: Partial<TVariables> | undefined) => ObservableQuery.ResultPromise<ApolloClient.QueryResult<TData>>;
	fetchMore!: <TFetchData = TData, TFetchVars extends OperationVariables = TVariables>(options: ObservableQuery.FetchMoreOptions<TData, TVariables, TFetchData, TFetchVars>) => Promise<ApolloClient.QueryResult<TFetchData>>;
	updateQuery!: (mapFn: UpdateQueryMapFn<TData, TVariables>) => void;
	startPolling!: (pollInterval: number) => void;
	stopPolling!: () => void;
	subscribeToMore!: <TSubscriptionData = TData, TSubscriptionVariables extends OperationVariables = TVariables>(options: ObservableQuery.SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData, TVariables>) => () => void;

	// Internals
	protected _next = () => {};
	protected _unsubscribe = () => {};
	protected _subscribe: () => void;
	protected _result: ObservableQuery.Result<TData, "empty" | "complete" | "streaming" | "partial"> | undefined;
	protected _isLazy: boolean;
	protected _isExecuted = false;

	constructor(
		protected query: DocumentNode | TypedDocumentNode<TData, TVariables>,
		protected options?: QueryOptions<TData, TVariables>
	) {
		this.client = options?.client || ApolloClientContext.get();
		this._isLazy = options?.lazy === true;

		this.initializeCacheWithInitialData();

		this._subscribe = createSubscriber((update) => {
			this._next = update;
			// stop listening when all the effects are destroyed
			return () => this._unsubscribe()
		});

		// Auto-execute if not lazy
		if (!this._isLazy) {
			this._execute();
		}
		
	}

	private initializeCacheWithInitialData() {
		const { initialData = null, ...options } = this.options || {};

		if (!initialData) return;

		this.client.writeQuery<TData, TVariables>({
			query: this.query,
			data: initialData,
			...this.options
		} as any);
	}

	protected _execute() {
		this.observable = this.client.watchQuery<TData, TVariables>({
			query: this.query,
			...this.options
		} as any);

		const subscription = this.observable
			.pipe(observeOn(asapScheduler))
			.subscribe((result) => {
				this._next();
				this.previousData = this._result?.data;
				this._result = result;
			});

		this._unsubscribe = () => subscription.unsubscribe();

		this.refetch = this.observable.refetch.bind(this.observable);
		this.fetchMore = this.observable.fetchMore.bind(this.observable);
		this.updateQuery = this.observable.updateQuery.bind(this.observable);
		this.startPolling = this.observable.startPolling.bind(this.observable);
		this.stopPolling = this.observable.stopPolling.bind(this.observable);
		this.subscribeToMore = this.observable.subscribeToMore.bind(this.observable);
	}

	// Getters with explicit type annotations
	get variables(): TVariables | undefined {
		this._subscribe();
		return this.observable?.variables;
	}

	get data(): TData | DeepPartial<TData> | undefined {
		this._subscribe();
		return this._result?.data;
	}

	get loading(): boolean | undefined {
		this._subscribe();
		return this._result?.loading;
	}

	get error(): ErrorLike | undefined {
		this._subscribe();
		return this._result?.error;
	}

	get dataState(): "empty" | "complete" | "streaming" | "partial" | undefined {
		this._subscribe();
		return this._result?.dataState;
	}

	get networkStatus(): NetworkStatus | undefined {
		this._subscribe();
		return this._result?.networkStatus;
	}
}

// Query class with execute method
class LazyQuery<TData = any, TVariables extends OperationVariables = OperationVariables> extends BaseQuery<TData, TVariables> {
	execute(options?: QueryOptions<TData, TVariables>): Promise<ObservableQuery.Result<TData, "empty" | "complete" | "streaming" | "partial">> {
		return new Promise<ObservableQuery.Result<TData, "empty" | "complete" | "streaming" | "partial">>(resolve => {
			this.options = { ...this.options, ...options } as QueryOptions<TData, TVariables>;
			this._execute();
			this._isExecuted = true;

			const subscription = this.observable
				.pipe(observeOn(asapScheduler))
				.subscribe((result) => {
					if (result.data || result.error) resolve(result);
					this._next();
					this.previousData = this._result?.data;
					this._result = result;
				});

			this._unsubscribe = () => subscription.unsubscribe();
		});
	}
}

// Type definitions for constructor overloads
type OptionsWithExecute<TData, TVariables extends OperationVariables> = QueryOptions<TData, TVariables> & { lazy: true };
type OptionsWithoutExecute<TData, TVariables extends OperationVariables> = QueryOptions<TData, TVariables> & { lazy?: false };

// Hybrid constructor interface
interface QueryConstructor {
	new <TData = any, TVariables extends OperationVariables = OperationVariables>(
		query: DocumentNode | TypedDocumentNode<TData, TVariables>,
		options: OptionsWithExecute<TData, TVariables>
	): LazyQuery<TData, TVariables>;
	new <TData = any, TVariables extends OperationVariables = OperationVariables>(
		query: DocumentNode | TypedDocumentNode<TData, TVariables>,
		options?: OptionsWithoutExecute<TData, TVariables>
	): BaseQuery<TData, TVariables>;
}

// Implementation
export const Query: QueryConstructor = function <TData = any, TVariables extends OperationVariables = OperationVariables>(
	this: any,
	query: DocumentNode | TypedDocumentNode<TData, TVariables>,
	options?: QueryOptions<TData, TVariables>
) {
	if (options?.lazy === true) {
		return new LazyQuery(query, options);
	}
	return new BaseQuery(query, options);
} as any;
export type Query = typeof Query;