/* Autor: Lukas Behnke (FH Münster) */
import Chart from 'chart.js/auto';
import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { PageMixin } from '../../page.mixin';
import sharedStyle from '../../shared.css';
import componentStyle from './doughnut-chart.css';

@customElement('app-doughnut-chart')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DoughnutChart extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];
  @query('#chart')
  canvas!: HTMLCanvasElement;

  @property()
  data!: object;

  @state() private chart?: Chart<'doughnut', string[], string> | Chart<'doughnut', number[], string>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updated(changed: any) {
    if (changed.has('data')) {
      this.chart?.destroy();
      this.getChart();
    }
  }
  //get the Chart based on the data
  async getChart() {
    const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d')!;
    const categoryNames = [];
    const categoryValues = [];
    for (const [key, value] of Object.entries(this.data)) {
      if (key == 'month' || key == 'year' || key.endsWith('id') || key == 'userId' || key == 'createdAt') continue;
      if (key == 'totalSum') {
        if (value == 0) {
          //render a default chart placeholder to show there is no Entry for this month
          this.setNoEntriesChart(ctx);
          return;
        }
        continue;
      }
      categoryNames.push(key);
      categoryValues.push(value);
    }
    if ('salary' in this.data) this.setEarningChart(ctx, categoryNames, categoryValues);
    else this.setExpenditureChart(ctx, categoryNames, categoryValues);
  }

  async setEarningChart(ctx: CanvasRenderingContext2D, categoryNames: string[], categoryValues: string[]) {
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryNames,
        datasets: [
          {
            label: 'Earnings',
            data: categoryValues,
            backgroundColor: [
              'rgb(3, 140, 12)',
              'rgb(102, 255, 153)',
              'rgb(153, 255, 102)',
              'rgb(0, 204, 153)',
              'rgb(0, 153, 153)',
              'rgb(0, 143, 179)'
            ],
            hoverOffset: 4
          }
        ]
      }
    });
  }

  async setExpenditureChart(ctx: CanvasRenderingContext2D, categoryNames: string[], categoryValues: string[]) {
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryNames,
        datasets: [
          {
            label: 'Expenditures',
            data: categoryValues,
            backgroundColor: [
              'rgb(128, 0, 0)',
              'rgb(179, 0, 0)',
              'rgb(255, 51, 51)',
              'rgb(102, 0, 51)',
              'rgb(255, 128, 128)',
              'rgb(255, 92, 51)',
              'rgb(204, 0, 68)',
              'rgb(128, 43, 0)',
              'rgb(255, 153, 102)'
            ],
            hoverOffset: 4
          }
        ]
      }
    });
  }

  async setNoEntriesChart(ctx: CanvasRenderingContext2D) {
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['No Entries'],
        datasets: [
          {
            label: 'NoEntries',
            data: [1],
            backgroundColor: ['rgb(153, 153, 153)'],
            hoverOffset: 4
          }
        ]
      }
    });
  }

  render() {
    return html`<div><canvas id="chart" width="100%" height="100%"></canvas></div> `;
  }
}
