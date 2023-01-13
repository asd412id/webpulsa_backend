class StringHelper {
  numberRange(start, end) {
    return new Array(end - start + 1).fill().map((d, i) => i + start);
  }
  alphabetRange(start, end) {
    return new Array(end.charCodeAt(0) - start.charCodeAt(0) + 1).fill().map((d, i) => String.fromCharCode(i + start.charCodeAt(0)));
  }

  parseNumber(number) {
    const val = String(number).replace(/,/g, '.').replace(/[^0-9.]/g, '');
    return val === '' || (!String(val).includes('.') && isNaN(parseFloat(val))) ? 0 : (String(val).startsWith('0') && !String(val).startsWith('0.') ? parseInt(val) : (String(val).split('.').length - 1 > 1 || String(val).split(',').length - 1 > 0) ? parseFloat(val) : val)
  }
}

module.exports = new StringHelper;