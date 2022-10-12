class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.readyToReset = false;
    this.clear();
    this.monoOperation = [];
    this.currentNegativeSqrt = false;
    this.previousNegativeSqrt = false;
  }

  clear() {
    this.currentOperand = "";
    this.previousOperand = "";
    this.operation = undefined;
    this.readyToReset = false;
    this.monoOperation = [];
    this.currentNegativeSqrt = false;
    this.previousNegativeSqrt = false;
  }

  delete() {
    if (this.monoOperation.includes("x²")) {
      this.monoOperation.pop();
    } else if (this.currentOperand !== 0) {
      this.currentOperand = this.currentOperand.toString().slice(0, -1);
    } else if (this.currentOperand === 0) {
      this.monoOperation.pop();
    }
  }

  appendNumber(number) {
    if (number === "." && this.currentOperand.includes(".")) return;
    this.currentOperand = this.currentOperand.toString() + number.toString();
  }

  chooseOperation(operation) {
    if (this.currentOperand === "" && operation !== "-" && operation !== "√") {
      return;
    }
    if (this.currentOperand !== "" && operation == "√") {
      this.currentOperand = "";
    }
    if (
      (operation === "-" || operation === "√") &&
      this.currentOperand === ""
    ) {
      this.monoOperation.push(operation);
      return;
    }
    if (operation === "x²" && this.currentOperand !== "") {
      this.monoOperation.push(operation);
      return;
    }

    if (
      this.currentOperand !== "" &&
      (this.previousOperand !== "" || this.monoOperation.length !== 0)
    ) {
      this.compute();
    }
    this.previousOperand = this.currentOperand;
    this.previousNegativeSqrt = this.currentNegativeSqrt;
    this.operation = operation;
    this.currentOperand = "";
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (!isNaN(current) && this.monoOperation.length !== 0) {
      while (this.monoOperation.length !== 0) {
        let currentMO = this.monoOperation.pop();
        switch (currentMO) {
          case "-":
            computation = (computation || current) * -1;
            break;
          case "√":
            if ((computation || current) < 0) {
              this.currentNegativeSqrt = true;
            }
            computation = Math.sqrt(Math.abs(computation || current));
            break;
          case "x²":
            computation = Math.pow(computation || current, 2);
            if (this.currentNegativeSqrt) {
              this.currentNegativeSqrt = false;
            }
            break;
          default:
            break;
        }
      }
      this.currentOperand = parseFloat(computation.toFixed(12));
    }

    if (isNaN(prev) || isNaN(current)) return;
    switch (this.operation) {
      case "+":
        computation = prev + (computation || current);
        break;
      case "-":
        computation = prev - (computation || current);
        break;
      case "*":
        computation = prev * (computation || current);
        break;
      case "÷":
        computation = prev / (computation || current);
        break;
      default:
        return;
    }
    this.readyToReset = true;
    this.currentOperand = parseFloat(computation.toFixed(12));
    this.operation = undefined;
    this.previousOperand = "";
  }

  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      integerDisplay = integerDigits.toLocaleString("en", {
        maximumFractionDigits: 0,
      });
    }
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    let copyMonoOperation = this.monoOperation.slice();
    let tempStringOperand = this.getDisplayNumber(this.currentOperand);
    if (this.currentNegativeSqrt) {
      tempStringOperand = `${tempStringOperand}i`;
    }
    while (copyMonoOperation.length !== 0) {
      let itemMO = copyMonoOperation.pop();
      switch (itemMO) {
        case "-":
          tempStringOperand = `-${tempStringOperand}`;
          break;
        case "√":
          tempStringOperand = `√${tempStringOperand}`;
          break;
        case "x²":
          tempStringOperand = `${tempStringOperand}²`;
          break;
        default:
          return;
      }
    }

    this.currentOperandTextElement.innerText = tempStringOperand;
    if (this.operation != null) {
      this.previousOperandTextElement.innerText = `${this.getDisplayNumber(
        this.previousOperand
      )}${this.previousNegativeSqrt ? "i" : ""} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = "";
    }
  }
}

const numberButtons = document.querySelectorAll("[data-number]");
const operationButtons = document.querySelectorAll("[data-operation]");
const equalsButton = document.querySelector("[data-equals]");
const deleteButton = document.querySelector("[data-delete]");
const allClearButton = document.querySelector("[data-all-clear]");
const previousOperandTextElement = document.querySelector(
  "[data-previous-operand]"
);
const currentOperandTextElement = document.querySelector(
  "[data-current-operand]"
);

const calculator = new Calculator(
  previousOperandTextElement,
  currentOperandTextElement
);

numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (
      calculator.previousOperand === "" &&
      calculator.currentOperand !== "" &&
      calculator.readyToReset
    ) {
      calculator.currentOperand = "";
      calculator.readyToReset = false;
    }
    calculator.appendNumber(button.innerText);
    calculator.updateDisplay();
  });
});

operationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    calculator.chooseOperation(button.innerText);
    calculator.updateDisplay();
  });
});

equalsButton.addEventListener("click", (button) => {
  calculator.compute();
  calculator.updateDisplay();
});

allClearButton.addEventListener("click", (button) => {
  calculator.clear();
  calculator.updateDisplay();
});

deleteButton.addEventListener("click", (button) => {
  calculator.delete();
  calculator.updateDisplay();
});
