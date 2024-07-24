<template>
    <main>
        <p class="text-sm italic mt-2">
            Please select files to do the calculation. All calculations are being done at front-end, so no
            files are
            being stored on our servers.
        </p>
        <div v-for="(file, index) in fileInputs" :key="file.id" class="mt-1">
            <label class="block" :for="file.id">{{ file.label }}</label>
            <input class="block" type="file" :id="file.id" :name="file.id" multiple
                @change="onFileChange($event.target.name, $event.target.files)" />
        </div>
        <button v-if="showDownload" @click="download" class="text-blue-500 underline font-medium mt-4">Download as text file</button>
    </main>
</template>

<script>
import { nextTick } from 'vue';

export default {
    data() {
        return {
            fileInputs: [
                { id: 'files', label: 'Choose your files:' },
            ],
            flat_data: {},
            file_data: {},
            showDownload: false,
        }
    },
    methods: {
        async onFileChange(name, files) {
            this.showDownload = false;
            this.flat_data = {}
            this.file_data = {}
            await this.extractFileDatas(files);
            setTimeout(() => {
                this.showDownload = true;
            }, 250);
        },
        async extractFileDatas(files) {
            this.flat_data = {}
            this.file_data = {}

            const new_file_data = {}
            const new_flat_data = {}

            Array.from(files).forEach(async (file, i) => {
                const data = await this.readFile(file)
                new_file_data[file.name] = data

                Object.keys(data).forEach(row_key => {
                    if (!new_flat_data[row_key]) {
                        new_flat_data[row_key] = { x: row_key, values: [data[row_key]] }
                    } else {
                        new_flat_data[row_key].values.push(data[row_key])
                    }
                })
            });

            this.flat_data = new_flat_data
            this.file_data = new_file_data;
        },
        download() {
            let string = ""
            string += `# EKINNONO ${new Date()}\n# Y mean for files; ${Object.keys(this.file_data).join(', ')}.\n\n`
            string += `X\tmean\n`

            Object.values(this.flat_data).forEach(data => {
                string += `${data.x}\t${this.arrayMean(data.values)}\n`
            })

            var blob = new Blob([string], { type: "txt" });

            var a = document.createElement('a');
            a.download = Date.now();
            a.href = URL.createObjectURL(blob);
            a.dataset.downloadurl = ["txt", a.download, a.href].join(':');
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
        },
        extractXValues(arr) {
            // Assuming each element in arr is a pair [x, y], return only the x values
            return arr?.map(el => el[0]);
        },
        extractYValues(arr) {
            // Assuming each element in arr is a pair [x, y], return only the y values
            return arr?.map(el => el[1]);
        },
        normalize(val, min, max) {
            // Shift to positive to avoid issues when crossing the 0 line
            if (min < 0) {
                max += 0 - min;
                val += 0 - min;
                min = 0;
            }
            // Shift values from 0 - max
            val = val - min;
            max = max - min;
            return Math.max(0, Math.min(1, val / max));
        },
        arrayMin(arr) {
            return arr.reduce(function (p, v) {
                if (typeof p !== 'number') return v;
                if (typeof v !== 'number') return p;
                return (p < v ? p : v);
            });
        },
        arrayMax(arr) {
            return arr.reduce(function (p, v) {
                if (typeof p !== 'number') return v;
                if (typeof v !== 'number') return p;
                return (p > v ? p : v);
            });
        },
        arrayMean(arr) {
            const sum = arr.reduce((a, b) => {
                if (typeof a !== 'number') return b;
                if (typeof b !== 'number') return a;
                return a + b;
            }, 0);
            const count = arr.filter(item => typeof item === 'number').length;
            return count > 0 ? sum / count : 0;
        },
        async readFile(file) {
            const text = await file.text();
            let file_obj = {}
            const rows = text.split('\n')
                .filter(line => !line.startsWith('#')) // Remove header lines
                .map(line => line
                    .replace(/[\t\r]/g, ' ') // Replace tabs and carriage returns with spaces
                    .split(' ') // Split by space
                    .map(Number) // Convert each element to a number
                );

            const y_values = this.extractYValues(rows)
            const min_val = this.arrayMin(y_values);
            const max_val = this.arrayMax(y_values);

            rows.forEach(row => {
                file_obj[row[0]] = this.normalize(row[1], min_val, max_val)
            })

            return file_obj;
        },
    }
}
</script>