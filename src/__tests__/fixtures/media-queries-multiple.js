// @flow

import type { SheetDefinitions } from '../../create';

export default ({
  aaa: {
    'color': 'red',
    'fontSize': 32,
    '@media print': {
      color: 'red',
      fontSize: 16,
    },
    '@media (min-width: 30em) and (max-width: 50em)': {
      color: 'blue',
    },
  },
  bbb: {
    '@media print': {
      color: 'green',
    },
  },
}: SheetDefinitions);
