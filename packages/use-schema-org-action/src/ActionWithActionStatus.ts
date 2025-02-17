import { type ActionStatusType } from './ActionStatusType.ts';

/** [Action](https://schema.org/Action) with [`actionStatus`](https://schema.org/actionStatus) property. */
export type ActionWithActionStatus<T> = T & {
  /** Indicates the current disposition of the Action. */
  actionStatus: ActionStatusType;
};
