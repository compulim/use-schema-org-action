import { type ActionStatusType } from './ActionStatusType';

export type ActionWithActionStatus<T> = T & {
  actionStatus: ActionStatusType;
};
