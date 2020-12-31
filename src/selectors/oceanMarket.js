// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

import { createSelector } from 'reselect';

import type { Rates } from 'models/Asset';
import { getRate } from 'utils/assets';
import { defaultFiatCurrency, OCEAN } from 'constants/assetsConstants';
import { baseFiatCurrencySelector, ratesSelector } from './selectors';


export const oceanTokenRateSelector = createSelector(
  ratesSelector,
  baseFiatCurrencySelector,
  (rates: Rates, baseFiatCurrency: ?string) => {
    const fiatCurrency = baseFiatCurrency || defaultFiatCurrency;
    return getRate(rates, OCEAN, fiatCurrency);
  },
);

export const oceanTokenRateByCurrencySelector = createSelector(
  ratesSelector,
  (rates: Rates) => rates?.[OCEAN] || {},
);

