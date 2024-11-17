<template>
  <main>
    <p class="text-sm italic mt-2 mb-4">
      Please select at least one reference and experimental file to calculate correlations. 
      All calculations are performed in your browser - no files are stored on our servers.
    </p>

    <div v-for="file in fileInputs" :key="file.id" class="mt-4">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" :for="file.id">
        {{ file.label }}
      </label>
      <input
        class="block w-full mb-1 text-xs text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        type="file"
        :id="file.id"
        :name="file.id"
        accept=".txt"
        @change="onFileChange($event.target.name, $event.target.files[0])"
      />
      <div v-if="errors[file.id]" class="mt-2 p-4 text-sm text-red-800 rounded-lg bg-red-50">
        {{ errors[file.id] }}
      </div>
    </div>

    <div class="mt-6">
      <p v-for="(corr, index) in correlations" :key="index">
        {{ corr.label }}: <strong>{{ formatCorrelation(corr.value) }}</strong>
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
      errors: {}
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
    formatCorrelation(value) {
      return value?.toFixed(6) || "Not calculated"
    },

    validateDataFormat(data) {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid file format: File appears to be empty')
      }

      // Check first few rows to determine if format is correct
      const sampleRows = data.slice(0, Math.min(5, data.length))
      for (const [index, row] of sampleRows.entries()) {
        if (!Array.isArray(row) || row.length !== 2) {
          throw new Error(`Invalid data format at line ${index + 1}: Each line must contain exactly two numbers`)
        }
        if (row.some(val => typeof val !== 'number' || isNaN(val))) {
          throw new Error(`Invalid data format at line ${index + 1}: Both values must be valid numbers`)
        }
      }

      return true
    },

    parseFileContent(text) {
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))

      return lines.map((line, index) => {
        const values = line
          .replace(/[\t\r,]+/g, ' ') // Replace tabs, commas, and carriage returns with spaces
          .split(/\s+/) // Split by any number of whitespace characters
          .map(val => {
            const num = parseFloat(val)
            if (isNaN(num)) {
              throw new Error(`Invalid number at line ${index + 1}: "${val}"`)
            }
            return num
          })

        if (values.length !== 2) {
          throw new Error(`Invalid line format at line ${index + 1}: Expected 2 values, got ${values.length}`)
        }

        return values
      })
    },

    calculatePearsonCorrelation(x, y) {
      if (!x || !y || x.length < 2 || y.length < 2) {
        throw new Error('Insufficient data points for correlation calculation')
      }

      if (x.length !== y.length) {
        throw new Error(`Data length mismatch: ${x.length} vs ${y.length} points`)
      }

      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
      let n = 0

      for (let i = 0; i < x.length; i++) {
        const xi = x[i], yi = y[i]
        if (isNaN(xi) || isNaN(yi)) {
          throw new Error(`Invalid data point at index ${i}`)
        }
        n++
        sumX += xi
        sumY += yi
        sumXY += xi * yi
        sumX2 += xi * xi
        sumY2 += yi * yi
      }

      const meanX = sumX / n
      const meanY = sumY / n
      const numerator = sumXY - n * meanX * meanY
      const denominator = Math.sqrt((sumX2 - n * meanX * meanX) * (sumY2 - n * meanY * meanY))

      if (denominator === 0) {
        throw new Error('Cannot calculate correlation: No variation in data')
      }

      return numerator / denominator
    },

    extractYValues(arr) {
      return arr?.map(el => el[1])
    },

    async readFile(file) {
      try {
        const text = await file.text()
        return this.parseFileContent(text)
      } catch (error) {
        throw new Error(`Error reading file: ${error.message}`)
      }
    },

    async onFileChange(name, file) {
      try {
        // Clear previous error for this file
        this.$set(this.errors, name, null)

        if (!file) {
          throw new Error('No file selected')
        }

        if (!file.name.toLowerCase().endsWith('.txt')) {
          throw new Error('Please upload a .txt file')
        }

        const content = await this.readFile(file)
        this.validateDataFormat(content)

        // Extract Y values and update graph data
        this.$set(this.graph_data, name, this.extractYValues(content))
        
        // Recalculate correlations
        this.calculateCorrelations()

      } catch (error) {
        console.error(`Error processing file ${name}:`, error)
        this.$set(this.errors, name, error.message)
        
        // Clear corresponding correlation
        if (name === 'ref_one') {
          this.ref_one_corr = null
        } else if (name === 'ref_two') {
          this.ref_two_corr = null
        } else if (name === 'exp') {
          this.ref_one_corr = null
          this.ref_two_corr = null
        }
      }
    },

    calculateCorrelations() {
      const { exp, ref_one, ref_two } = this.graph_data

      try {
        if (exp && ref_one) {
          this.ref_one_corr = this.calculatePearsonCorrelation(ref_one, exp)
        }

        if (exp && ref_two) {
          this.ref_two_corr = this.calculatePearsonCorrelation(ref_two, exp)
        }
      } catch (error) {
        console.error('Error calculating correlations:', error)
        // Clear correlations if calculation fails
        this.ref_one_corr = null
        this.ref_two_corr = null
      }
    }
  }
}
</script>