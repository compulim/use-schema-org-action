import React, { Fragment, memo, useCallback, type FormEventHandler } from 'react';
import { parseTemplate } from 'url-template';
import { useSchemaOrgAction, type PropertyValueSpecification } from 'use-schema-org-action';

type SearchAction = {
  '@type': 'SearchAction';
  target: string;
  query?: string | undefined;
  'query-input': PropertyValueSpecification;
};

type SearchAppProps = { action: SearchAction };

const SearchApp = ({ action }: SearchAppProps) => {
  const [state, setState, { inputValidity, submit }] = useSchemaOrgAction<SearchAction>(
    action,
    async (input, request) => {
      const url = new URL(
        parseTemplate(action.target).expand(
          Object.fromEntries(
            input
              .entries()
              .map(([key, value]) => [
                key,
                value instanceof Date ? value.toISOString() : typeof value === 'undefined' ? null : value
              ])
          )
        )
      );

      url.search = new URLSearchParams(
        Array.from(
          input.entries().map(([key, value]) => [key, value instanceof Date ? value.toISOString() : `${value || ''}`])
        )
      ).toString();

      const res = await fetch(url, {
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
        <input onInput={handleQueryInput} type="search" value={state.query || ''} />
        <button disabled={!inputValidity.valid} type="submit">
          Submit
        </button>
      </form>
    </Fragment>
  );
};

export default memo(SearchApp);
