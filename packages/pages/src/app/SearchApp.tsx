import React, { Fragment, memo, useCallback, useMemo, type FormEventHandler } from 'react';
import { parseTemplate } from 'url-template';
import { toURLTemplateData, useSchemaOrgAction, type PropertyValueSpecification } from 'use-schema-org-action';

type SearchAction = {
  '@type': 'SearchAction';
  query?: string | undefined;
  'query-input': PropertyValueSpecification;
  result?: [] | undefined;
  'result-output': PropertyValueSpecification;
  target: string;
};

const SearchApp = () => {
  const action = useMemo<SearchAction>(
    () => ({
      '@type': 'SearchAction',
      'query-input': 'required maxlength=100 name=q',
      'result-output': 'multiple',
      target: 'https://example.com/search?q={q}'
    }),
    []
  );

  const [actionState, setActionState, { inputValidity, perform }] = useSchemaOrgAction<SearchAction>(
    action,
    async (request, inputVariables) => {
      // `url` is https://example.com/search?q=...
      // `request` is { "query": "..." }
      const res = await fetch(new URL(parseTemplate(action.target).expand(toURLTemplateData(inputVariables))), {
        body: JSON.stringify(request),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });

      return await res.json();
    }
  );

  const handleQueryInput = useCallback<FormEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => setActionState(state => ({ ...state, query: value })),
    [setActionState]
  );

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault();
      perform();
    },
    [perform]
  );

  return (
    <Fragment>
      <h2>Search</h2>
      <form onSubmit={handleSubmit}>
        <input autoFocus={true} onInput={handleQueryInput} type="search" value={actionState['query'] || ''} />
        <button disabled={!inputValidity.valid} type="submit">
          {actionState['actionStatus'] === 'ActiveActionStatus' ? 'Submitting...' : 'Submit'}
        </button>
        {actionState['actionStatus'] === 'FailedActionStatus' ? <span>Failed to submit</span> : undefined}
      </form>
      <h3>Current action state</h3>
      <pre>{JSON.stringify(actionState, null, 2)}</pre>
    </Fragment>
  );
};

export default memo(SearchApp);
