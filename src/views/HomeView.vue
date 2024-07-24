<template>
  <main>
    <p class="text-sm italic mt-2">
      Please select atleast one reference and experimental to calculate. All calculations are being done at front-end, so no files are
      being stored on our servers.
    </p>
    <div v-for="(file, index) in fileInputs" :key="file.id" class="mt-1">
      <label class="block" :for="file.id">{{ file.label }}</label>
      <input class="block" type="file" :id="file.id" :name="file.id"
        @change="onFileChange($event.target.name, $event.target.files[0])" />
    </div>
    <div class="mt-4">
      <p v-for="(corr, index) in correlations" :key="index">
        {{ corr.label }}: <strong>{{ corr.value?.toFixed(6) || "Not calculated" }}</strong>
      </p>
    </div>
  </main>
</template>

<script>
export default {
  data() {
    return {
      fileInputs: [
        { id: 'ref_one', label: 'Choose reference one:' },
        { id: 'ref_two', label: 'Choose reference two:' },
        { id: 'exp', label: 'Choose experimental:' }
      ],
      graph_data: {},
      ref_one_corr: null,
      ref_two_corr: null,
    }
  },
  computed: {
    correlations() {
      return [
        { label: 'Reference one to experimental', value: this.ref_one_corr },
        { label: 'Reference two to experimental', value: this.ref_two_corr }
      ]
    }
  },
  methods: {
    async onFileChange(name, file) {
      if (!file) return;
      const content = await this.readFile(file);
      // Extract only the Y values from the parsed file content
      this.graph_data[name] = this.extractYValues(content);
      this.calculateCorrelations();
    },

    extractYValues(arr) {
      // Assuming each element in arr is a pair [x, y], return only the y values
      return arr?.map(el => el[1]);
    },

    calculateCorrelations() {
      const { exp, ref_one, ref_two } = this.graph_data;
      if (exp && ref_one) {
        // Calculate Pearson correlation between reference one and experimental data
        this.ref_one_corr = this.calculatePearsonCorrelation(ref_one, exp);
      }

      if (exp && ref_two) {
        // Calculate Pearson correlation between reference two and experimental data
        this.ref_two_corr = this.calculatePearsonCorrelation(ref_two, exp);
      }
    },

    calculatePearsonCorrelation(x, y) {
      if (!x || !y) return null;

      // Initialize variables for sum calculations
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
      let n = 0;

      // Iterate through both arrays simultaneously
      for (let i = 0; i < x.length && i < y.length; i++) {
        const xi = x[i], yi = y[i];
        if (isNaN(xi) || isNaN(yi)) {
          console.log(`Problem at line ${i}`);
          continue;
        }
        n++;
        // Calculate running sums for correlation formula
        sumX += xi;
        sumY += yi;
        sumXY += xi * yi;
        sumX2 += xi * xi;
        sumY2 += yi * yi;
      }

      if (n < 2) return null; // Not enough data to calculate correlation

      const meanX = sumX / n;
      const meanY = sumY / n;

      // Calculate numerator and denominator for Pearson correlation formula
      // Formula: r = Σ((x - x̄)(y - ȳ)) / sqrt(Σ(x - x̄)² * Σ(y - ȳ)²)
      // This is a computationally efficient version of the formula
      const numerator = sumXY - n * meanX * meanY;
      const denominator = Math.sqrt((sumX2 - n * meanX * meanX) * (sumY2 - n * meanY * meanY));

      // Return correlation or 0 if denominator is 0 (to avoid division by zero)
      return denominator === 0 ? 0 : numerator / denominator;
    },

    async readFile(file) {
      const text = await file.text();
      return text.split('\n')
        .filter(line => !line.startsWith('#')) // Remove header lines
        .map(line => line
          .replace(/[\t\r]/g, ' ') // Replace tabs and carriage returns with spaces
          .split(' ') // Split by space
          .map(Number) // Convert each element to a number
        );
    },
  }
}
</script>