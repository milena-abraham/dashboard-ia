export const neoBrutalistTheme = {
  color: [
    '#815ae1', // Violeta principal
    '#bdf559', // Lima
    '#ff6b6b', // Rojo (anomalías/negativos)
    '#4ecdc4', // Cyan
    '#ffe66d', // Amarillo
    '#111111'  // Negro puro
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    color: '#111111'
  },
  title: {
    textStyle: {
      color: '#111111',
      fontWeight: 900
    },
    subtextStyle: {
      color: '#666666',
      fontWeight: 600
    }
  },
  line: {
    itemStyle: { borderWidth: 3 },
    lineStyle: { width: 3 },
    symbolSize: 6,
    symbol: 'circle',
    smooth: false // Neo-brutalism prefers sharp angles
  },
  bar: {
    itemStyle: {
      barBorderWidth: 2,
      barBorderColor: '#111111'
    }
  },
  pie: {
    itemStyle: {
      borderWidth: 2,
      borderColor: '#111111'
    }
  },
  scatter: {
    itemStyle: {
      borderWidth: 2,
      borderColor: '#111111'
    }
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: { color: '#111111', width: 2 }
    },
    axisTick: {
      show: true,
      lineStyle: { color: '#111111', width: 2 }
    },
    axisLabel: {
      show: true,
      color: '#111111',
      fontWeight: 'bold'
    },
    splitLine: {
      show: false
    }
  },
  valueAxis: {
    axisLine: {
      show: true,
      lineStyle: { color: '#111111', width: 2 }
    },
    axisTick: {
      show: true,
      lineStyle: { color: '#111111', width: 2 }
    },
    axisLabel: {
      show: true,
      color: '#111111',
      fontWeight: 'bold'
    },
    splitLine: {
      show: true,
      lineStyle: { color: '#e5e7eb', width: 1, type: 'dashed' }
    }
  },
  logAxis: {
    axisLine: { show: true, lineStyle: { color: '#111111', width: 2 } },
    axisTick: { show: true, lineStyle: { color: '#111111', width: 2 } },
    axisLabel: { show: true, color: '#111111', fontWeight: 'bold' },
    splitLine: { show: true, lineStyle: { color: '#e5e7eb', width: 1, type: 'dashed' } }
  },
  timeAxis: {
    axisLine: { show: true, lineStyle: { color: '#111111', width: 2 } },
    axisTick: { show: true, lineStyle: { color: '#111111', width: 2 } },
    axisLabel: { show: true, color: '#111111', fontWeight: 'bold' },
    splitLine: { show: false }
  },
  tooltip: {
    backgroundColor: '#111111',
    borderColor: '#111111',
    textStyle: { color: '#ffffff', fontWeight: 'bold' },
    padding: [12, 16],
    borderRadius: 0 // Sharp corners
  }
};
