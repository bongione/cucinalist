
export interface StorageTaskOrTx<Ops, R extends PromiseLike<unknown>> {
  (measurementStorage: Ops): R;
}

export interface TransactionalStorage<Ops> {
  tx: <R extends PromiseLike<unknown>>(fn: StorageTaskOrTx<Ops, R>) => R;
  task: <R extends PromiseLike<unknown>>(fn: StorageTaskOrTx<Ops, R>) => R;
}
