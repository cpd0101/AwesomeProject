/**
 * @file index.ios.js
 * @author tanshaohui <tanshaohui@baidu.com>
 * @date 2015-11-27 16:18:08
 * @last-modified-by tanshaohui
 * @last-modified-time 2015-11-28 13:15:28
 */

'use strict';

require('./mod.js');

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var AwesomeProject = React.createClass({
  getInitialState: function() {
    return {
      loaded: false,
    };
  },

  componentDidMount: function() {
    var _this = this;
    require.async('ios/index.js', function (IndexView) {
      _this.renderLoadedView = function () {
        return (
          <IndexView />
        );
      };
      _this.setState({
        loaded: true
      });
    }, function () {
      _this.renderLoadedView = function () {
        return (
          <View style={styles.container}>
            <Text>
              Load Error!
            </Text>
          </View>
        );
      };
      _this.setState({
        loaded: true
      });
    });
  },

  render: function() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    } else {
      return this.renderLoadedView();
    }
  },

  renderLoadingView: function() {
    return (
      <View style={styles.container}>
        <Text>
          Loading...
        </Text>
      </View>
    );
  },

  renderLoadedView: function() {
    return (
      <View style={styles.container}>
        <Text>
          Load Complete!
        </Text>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
