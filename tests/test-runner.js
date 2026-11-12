/**
 * Lightweight browser test runner framework
 */
export class TestRunner {
  constructor() {
    this.suites = [];
    this.totalPass = 0;
    this.totalFail = 0;
  }

  describe(name, fn) {
    this.suites.push({ name, fn });
  }

  async run() {
    const outputEl = document.getElementById('test-results');
    if (!outputEl) return;
    outputEl.innerHTML = '';

    for (const suite of this.suites) {
      const suiteDiv = document.createElement('div');
      suiteDiv.className = 'test-suite';

      const title = document.createElement('h3');
      title.textContent = suite.name;
      suiteDiv.appendChild(title);

      const list = document.createElement('ul');
      list.className = 'test-list';

      const it = async (testName, testFn) => {
        const item = document.createElement('li');
        try {
          await testFn();
          item.className = 'test-item pass';
          item.innerHTML = `<span class="badge pass">PASS</span> ${testName}`;
          this.totalPass++;
        } catch (err) {
          item.className = 'test-item fail';
          item.innerHTML = `<span class="badge fail">FAIL</span> ${testName}<pre class="error-trace">${err.stack || err.message}</pre>`;
          this.totalFail++;
        }
        list.appendChild(item);
      };

      try {
        await suite.fn(it, this.expect);
      } catch (e) {
        console.error('Suite error:', e);
      }

      suiteDiv.appendChild(list);
      outputEl.appendChild(suiteDiv);
    }

    const summaryEl = document.getElementById('test-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <strong>Results:</strong>
        <span class="summary-pass">${this.totalPass} Passed</span>,
        <span class="summary-fail">${this.totalFail} Failed</span>
      `;
    }
  }

  expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but received ${JSON.stringify(actual)}`);
        }
      },
      toEqual(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected deep equality:\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
        }
      },
      toBeTruthy() {
        if (!actual) throw new Error(`Expected truthy value, but received ${actual}`);
      },
      toBeFalsy() {
        if (actual) throw new Error(`Expected falsy value, but received ${actual}`);
      },
      toContain(item) {
        if (!actual || !actual.includes(item)) {
          throw new Error(`Expected collection to contain ${JSON.stringify(item)}`);
        }
      }
    };
  }
}
