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
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import t from 'translations/translate';

import { getFormattedRate } from 'utils/assets';
import { formatAmount, formatFiat } from 'utils/common';

import { BaseText } from 'components/Typography';
import { Row } from 'components/Grid';

import { defaultFiatCurrency } from 'constants/assetsConstants';
import { baseFiatCurrencySelector, ratesSelector } from 'selectors';
import type { Rates } from 'models/Asset';

type Props = {
  amount: number,
  token: string,
  customFiatValue?: string | number,
};

const FiatValue = styled(BaseText)`
  margin-left: 4px;
`;

const TableTokenAndAmount = ({ amount, token, customFiatValue }: Props) => {
  const baseFiatCurrency: string = useSelector(baseFiatCurrencySelector) || defaultFiatCurrency;
  const rates: Rates = useSelector(ratesSelector);

  const fiatAmount = customFiatValue
    ? formatFiat(customFiatValue, baseFiatCurrency)
    : getFormattedRate(rates, amount, token, baseFiatCurrency);
  const formattedAmount = formatAmount(amount, 3);

  return (
    <Row wrap>
      <BaseText regular>{t('tokenValue', { value: formattedAmount, token })}</BaseText>
      <FiatValue regular secondary>{fiatAmount}</FiatValue>
    </Row>
  );
};

export default TableTokenAndAmount;
