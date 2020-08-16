
import moment from 'moment';
import edgeApi from './edgeApi';

const scaleMap = {
  m: 'minute',
  D: 'day',
  W: 'week',
  M: 'month'
}

export default async function edgeTimeSeriesApi(ticker, resolution, fDate, tDate) {
  const sort = 'asc';
  const toDate = tDate || moment().format('YYYY-MM-DD');
  const fromDate = fDate || moment().add(-5, 'months').format('YYYY-MM-DD');
  const [range, scale] = parseResolution(resolution);
  return edgeApi.get(`/time-series-data/${ticker}/range/${range}/${scale}/${fromDate}/${toDate}?sort=${sort}`);
}

function parseResolution(resolution) {
  let modif = '';
  if(!isNaN(resolution)) {
    modif = 'm'
  } else {
    modif = resolution[resolution.length - 1];
  }
  return [parseInt(resolution), scaleMap[modif]];
}

