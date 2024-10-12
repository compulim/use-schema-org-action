import { type ActionStatusType } from './ActionStatusType.ts';

export type ActionWithActionStatus<T> = T & {
  actionStatus: ActionStatusType;
};
