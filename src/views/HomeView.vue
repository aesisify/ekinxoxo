<template>
  <main>
    <p class="text-sm italic mt-2">
      Please select all three files to do the calculation. All calculations are being done at front-end, so no files are being stored on our servers.
    </p>
    <div class="mt-1">
      <label class="block" for="ref_one">Choose reference one:</label>
      <input class="block" type="file" id="ref_one" name="ref_one"
        @change="onFileChange($event.target.name, $event.target.files[0])" />
    </div>
    <div class="mt-1">
      <label class="block" for="ref_two">Choose reference two:</label>
      <input class="block" type="file" id="ref_two" name="ref_two"
        @change="onFileChange($event.target.name, $event.target.files[0])" />
    </div>
    <div class="mt-1">
      <label class="block" for="exp">Choose experimental:</label>
      <input class="block" type="file" id="exp" name="exp" @change="onFileChange($event.target.name, $event.target.files[0])" />
    </div>
    <div class="mt-4">
      <p>
        Reference one to experimental: <strong>{{ this.ref_one_corr || "Not calculated" }}</strong>
      </p>
      <p>
        Reference two to experimental: <strong>{{ this.ref_two_corr || "Not calculated" }}</strong>
      </p>
    </div>
  </main>
</template>

<script>
export default {
  data() {
    return {
      ref_one: null,
      ref_two: null,
      exp: null,
      graph_data: {},
      ref_one_corr: null,
      ref_two_corr: null,
    }
  },
  methods: {
    async onFileChange(n, f) {
      const cont = await this.reader(f);
      this.graph_data[n] = this.removeX(cont);
      if (this.graph_data.exp && this.graph_data.ref_one && this.graph_data.ref_two) {
        this.ref_one_corr = this.pcorr(this.graph_data.ref_one, this.graph_data.exp)
        this.ref_two_corr = this.pcorr(this.graph_data.ref_two, this.graph_data.exp)
      }
    },
    removeX(arr) {
      return arr?.map(el => el[1]);
    },
    removeY(arr) {
      return arr?.map(el => el[0]);
    },
    pcorr(x, y) {
      if (!x || !y) return;

      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumX2 = 0,
        sumY2 = 0;

      const minLength = Math.min(x.length, y.length);

      for (let i = 0; i < minLength; i++) {
        const xi = x[i];
        const yi = y[i];
        if(!isNaN(xi) && !isNaN(yi)) {
          sumX += xi;
          sumY += yi;
          sumXY += xi * yi;
          sumX2 += xi * xi;
          sumY2 += yi * yi;
        } else {
          console.log(`Problem at line ${i}`)
        }
      }

      const numerator = minLength * sumXY - sumX * sumY;
      const denominator = Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));

      if (denominator === 0) return 0; // handle division by zero

      return numerator / denominator;
    },

    async reader(file) {
      if (file) {
        const text = await file.text();
        const ret = []
        var lines = text.split('\n');
        for (var line = 0; line < lines.length; line++) {
          const line_text = lines[line].replace("\t", " ").replace("\r", "")
          if (!line_text.startsWith("#")) ret.push(line_text.split(" ").map(element => {
            return Number(element);
          }));
        }

        return ret;
      }
    },
  }
}
</script>