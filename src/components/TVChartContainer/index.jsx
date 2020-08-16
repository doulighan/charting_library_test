import * as React from 'react';
import moment from 'moment';
import './index.css';
import { widget } from '../../charting_library/charting_library.min';
import dataFeed from './datafeed';

export class TVChartContainer extends React.Component {
  static defaultProps = {
    symbol: 'AAPL',
    interval: '60',
    timeframe: '1m',
    containerId: 'tv_chart_container',
    libraryPath: '/charting_library/',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  state = {
    selectedDate: null
  }

  tvWidget = null;
  buttonDates = ['2020-07-23', '2020-02-12', '2020-01-08', '2019-04-24', '2018-10-30', '2016-02-02', '2014-04-14'];

  componentDidMount() {
    const widgetOptions = {
      // interval: this.props.interval,
      // timeframe: this.props.timeframe,
      symbol: this.props.symbol,
      datafeed: dataFeed,
      container_id: this.props.containerId,
      library_path: this.props.libraryPath,
      locale: 'en',
      disabled_features: ['header_symbol_search', 'go_to_date', 'header_saveload', 'symbol_search_hot_key', 'compare_symbol', 'header_compare'],
      enabled_features: ['side_toolbar_in_fullscreen_mode', 'header_in_fullscreen_mode'],
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      theme: 'Dark',
      debug: true
    };

    const tvWidget = new widget(widgetOptions);
    this.tvWidget = tvWidget;

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => { });
      tvWidget.chart().onVisibleRangeChanged().subscribe(
        null,
        (el) => { console.log('visible range subscriber:', el) }
      );
    });
  }

  componentDidUpdate() {
    console.log(this.state.selectedDate);
    if (this.state.selectedDate) {
      this.tvWidget.onChartReady(() => {
        this.tvWidget.chart().dataReady(() => {

          const date = moment(this.state.selectedDate, 'YYYY-MM-DD');
          const fromUnix = date.format('X');
          const toUnix = date.add(2, 'd').format('X');

          console.log(fromUnix, toUnix);
          console.log(`call to setVisibleRange(${fromUnix}, ${toUnix})`);

          this.tvWidget.chart().setVisibleRange({
            from: fromUnix,
            to: toUnix
          }).then(() => {
            console.log('setVisibleRange() promise resolved');
          });
        })
      })
    }
  }


  componentWillUnmount() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  }

  handleClick = (e) => {
    this.setState({ selectedDate: e.target.value });
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <div
          id={this.props.containerId}
          className={'TVChartContainer'}
          style={{ flexBasis: '70%' }}
        />
        <div style={{ flexBasis: '30%', marginTop: '50px' }}>
          {this.buttonDates.map((date, i) => {
            return (<div key={i} style={{ marginBottom: '20px' }}><button value={date} onClick={this.handleClick}>{date}</button></div>)
          })}
        </div>
      </div>
    );
  }
}
