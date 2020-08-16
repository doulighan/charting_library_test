import moment from 'moment';
import filter from 'lodash/filter';
import edgeTimeSeriesApi from './edgeTimeSeriesApi';
import edgeApi from './edgeApi';


const configurationData = {
  supported_resolutions: ['1', '3', '5', '15', '60', '1D', '1W', '1M'],
  exchanges: [],
  symbols_types: [],
  currency_codes: ['USD', 'EUR', 'GBP'],
  // supports_marks: true,
  supports_timescale_marks: false,
  supports_time: false,
}


var lastBar = {};


export default {


  onReady: async (callback) => {
    await callback(configurationData);
  },


  searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
    try {
      const response = await edgeApi.get(`/searchticker/${userInput}`)
      var out = [];
      if (response.data) {
        out = response.data.map(t => {
          return {
            symbol: t.Symbol,
            full_name: t.Symbol,
            description: t.name,
            ticker: t.Symbol,
            original_currency_code: t.currency,
          }
        });
      }
    } catch (err) { console.log('[searchSymbols]: ERROR! ', err); }
    onResultReadyCallback(out);
  },


  resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
    onSymbolResolvedCallback({
      name: symbolName,
      description: symbolName,
      ticker: symbolName,
      supported_resolutions: configurationData.supported_resolutions,
      sessions: '0930-1600',
      has_intraday: true,
      intraday_multipliers: [1,3,5,10,15,30,45,60],
      has_daily: true,
      // has_empty_bars: true,
      // has_weekly_and_monthly: true,
      pricescale: 100,
      minmov: 1,
      data_status: 'pulsed'
    })
  },


  getBars: async (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
    // console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
    var ff = moment(from, 'X').format('YYYY-MM-DD');
    var tt = moment(to, 'X').format('YYYY-MM-DD');
    try {
      var response = null;
      response = await edgeTimeSeriesApi(symbolInfo.ticker, resolution, ff, tt);
      if(response.data && response.data.resultsCount > 0) {
        const bars = response.data.results.map(bar => {
          return {
            time: bar.t,
            low: bar.l,
            high: bar.h,
            open: bar.o,
            close: bar.c,
            volume: bar.v
          }
        });
        const filtered = filter(bars, (b) => {
          const tickerTime = moment(b.time, 'x').format('X');
          return (tickerTime >= from && tickerTime <= to);
        })
        lastBar = filtered[filtered.length - 1];
        onHistoryCallback(filtered);
        return;
      }
    } catch(err) {
      console.log('[getBars]: ERROR ! ', err);
      onErrorCallback(err);
      return;
    }
    onHistoryCallback([]);
  },

  calculateHistoryDepth: function(resolution, resolutionBack, intervalBack) {
  },

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
    console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID);
    onRealtimeCallback(lastBar);
  },


  unsubscribeBars: (subscriberUID) => {
    console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
  },


}