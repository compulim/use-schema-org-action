import React, { Fragment, memo, useCallback, useState, type FormEventHandler } from 'react';
import { parseTemplate } from 'url-template';
import { toURLTemplateData, useSchemaOrgAction, type PropertyValueSpecification } from 'use-schema-org-action';

type SearchAction = {
  '@type': 'SearchAction';
  target: string;
  query?: string | undefined;
  'query-input': PropertyValueSpecification;
};

const SearchApp = () => {
  const [action] = useState<SearchAction>({
    '@type': 'SearchAction',
    'query-input': 'required maxlength=100 name=q',
    target: 'https://example.com/search?q={q}'
  });

  const [state, setState, { inputValidity, submit }] = useSchemaOrgAction<SearchAction>(
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
    ({ currentTarget: { value } }) => setState(state => ({ ...state, query: value })),
    [setState]
  );

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault();
      submit();
    },
    [submit]
  );

  return (
    <Fragment>
      <h2>Search</h2>
      <form onSubmit={handleSubmit}>
        <input autoFocus={true} onInput={handleQueryInput} type="search" value={state['query'] || ''} />
        <button disabled={!inputValidity.valid} type="submit">
          {state['actionStatus'] === 'ActiveActionStatus' ? 'Submitting...' : 'Submit'}
        </button>
        {state['actionStatus'] === 'FailedActionStatus' ? <span>Failed to submit</span> : undefined}
      </form>
    </Fragment>
  );
};

export default memo(SearchApp);
