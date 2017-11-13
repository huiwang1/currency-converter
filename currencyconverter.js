//#region rates
function FixerRates() {
    var _rates = {};

    this.getRates = function() {
        return _rates;
    }

    var r = new XMLHttpRequest();
    r.open("GET", "https://api.fixer.io/latest?base=USD&symbols=CAD,EUR", true);
    r.onload = function () {
      _rates = JSON.parse(r.response);
    };
    r.send();
}

FixerRates.prototype.convert = function(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    if (fromCurrency === this.getRates().base) {
        return amount * this.getRates().rates[toCurrency];
    }

    if (fromCurrency !== this.getRates().base) {
        var result = amount / this.getRates().rates[fromCurrency];

        if (toCurrency !== this.getRates().base) {
            result = result * this.getRates().rates[toCurrency];
        }

        return result;
    }

}

var RateLookup = (function () {
    var instance;

    function createInstance() {
        var object = new FixerRates();
        return object;
    }
 
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
//#endregion rates

//#region currencyconverter
function CurrencyConverter() {
    var _currencies = ['CAD', 'USD', 'EUR'];
    var _input = new CurrencyInput('Type in amount and select currency:', _currencies);
    var _output = new CurrencyInput('Converted amount:', _currencies, {readonly: 'true'});
    var _title = null;
    var _disclaimer = null;

    var _inputValue = 0;
    var _inputCurrency = 0;
    var _outputCurrency = 0;

    this.getInput = function() {
        return _input;
    }
    
    this.getOutput = function() {
        return _output;
    }

    this.getTitle = function() {
        return _title;
    }

    this.getDisclaimer = function() {
        return _disclaimer;
    }

    _title = document.createElement('h1');
    _title.innerText = 'Currency converter';

    _disclaimer = document.createElement('a');
    _disclaimer.innerText = 'disclaimer';
    _disclaimer.setAttribute('href', '#');

    _input.addInputEventHandler(function(e) {
        _inputValue = e.target.value;

        updateValues();
    });

    _input.addCurrencySelectEventHandler(function(e) {
        _inputCurrency = e.target.value;

        updateValues();
    });

    _output.addCurrencySelectEventHandler(function(e) {
        _outputCurrency = e.target.value;

        updateValues();
    });

    function updateValues() {
        var result = RateLookup.getInstance().convert(_inputValue, _currencies[_inputCurrency], _currencies[_outputCurrency]);
        _output.setValue(result);
    }
}

CurrencyConverter.prototype.render = function(id) {
    var container = document.getElementById(id);

    container.appendChild(this.getTitle());

    var input = document.createElement('div');
    input.setAttribute('id', 'inputbox'); //BUG oops, this is not unique
    container.appendChild(input);
    this.getInput().render('inputbox');

    var output = document.createElement('div');
    output.setAttribute('id', 'outputbox'); //BUG oops, this is not unique
    container.appendChild(output);
    this.getOutput().render('outputbox');

    var disclaimer = document.createElement('div');
    disclaimer.appendChild(this.getDisclaimer());
    container.appendChild(disclaimer);
}
//#endregion currencyconverter

//#region currencyinput
function CurrencyInput(title, currencies, inputAttributes) {
    var _heading = null;
    var _input = null;
    var _dropdown = null;

    this.getHeading = function() {
        return _heading;
    }

    this.getInput = function() {
        return _input;
    }

    this.getDropDown = function() {
        return _dropdown;
    }
 
    if (!!title) {
        _heading = document.createElement('h1');
        _heading.innerText = title;
    }

    _input = document.createElement('input');
    _input.setAttribute('placeholder', '0.00');
    _input.setAttribute('type', 'text');
    for (var attribute in inputAttributes) {
        if (inputAttributes.hasOwnProperty(attribute)) {
            _input.setAttribute(attribute, inputAttributes[attribute]);
        }
    }

    if (!!currencies) {
        _dropdown = document.createElement('select');

        for (var i = 0; i < currencies.length; i++) {
            var opt = document.createElement('option');
            opt.value = i;
            opt.innerHTML = currencies[i];
            _dropdown.appendChild(opt);
        }
    }
}

CurrencyInput.prototype.render = function(id) {
    var container = document.getElementById(id);

    if (!!this.getHeading()) {
        container.appendChild(this.getHeading());
    }

    if (!!this.getInput()) {
        container.appendChild(this.getInput());
    }

    if (!!this.getDropDown()) {
        container.appendChild(this.getDropDown());
    }
}

CurrencyInput.prototype.setValue = function(value) {
    if (!!this.getInput()) {
        this.getInput().value = value;
    }
}

CurrencyInput.prototype.addInputEventHandler = function(cb) {
    if (!!this.getInput()) {
        this.getInput().addEventListener('keyup', cb);  //TODO better event?
    }
}

CurrencyInput.prototype.addCurrencySelectEventHandler = function(cb) {
    if (!!this.getDropDown()) {
        this.getDropDown().addEventListener('change', cb);
    }
}
//#endregion currencyinput