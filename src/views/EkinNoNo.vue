<template>
    <main>
        <p class="text-sm italic mt-2">
            Please select files to do the calculation. All calculations are being done at front-end, so no
            files are being stored on our servers.
        </p>
        <div v-for="file in fileInputs" :key="file.id" class="mt-1">
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" :for="file.id">{{ file.label }}</label>
            <input class="block w-full mb-1 text-xs text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" type="file" :id="file.id" :name="file.id" multiple
                @change="onFileChange($event.target.files)" />
        </div>

        <button v-if="Object.keys(flatData).length > 0" @click="download" class="text-blue-500 underline font-medium mt-4">
            Download as text file
        </button>

        <div v-if="Object.keys(flatData).length > 0" class="mt-4">
            <button @click="showTable = !showTable" class="text-blue-500 underline font-medium mb-2">
                Show as table here
            </button>
            <div class="overflow-x-auto text-xs max-w-[200px]" v-if="showTable">
                <table class="min-w-full bg-gray-900 border border-gray-300">
                    <thead>
                        <tr>
                            <th class="px-2 py-1 bg-gray-800 border-b text-left border-r">X</th>
                            <th class="px-2 py-1 bg-gray-800 border-b text-left">Mean</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(data, x) in flatData" :key="x" class="hover:bg-gray-700">
                            <td class="px-2 py-1 border-b border-r">{{ x }}</td>
                            <td class="px-2 py-1 border-b">{{ arrayMean(data.values).toFixed(6) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</template>

<script>
export default {
    data() {
        return {
            fileInputs: [
                { id: 'files', label: 'Choose your files:' },
            ],
            flatData: {},
            fileData: {},
            showTable: false,
        };
    },
    methods: {
        async onFileChange(files) {
            this.flatData = {};
            this.fileData = {};
            await this.extractFileDatas(files);
        },
        async extractFileDatas(files) {
            for (const file of Array.from(files)) {
                const data = await this.readFile(file);
                this.$set(this.fileData, file.name, data);

                Object.entries(data).forEach(([rowKey, value]) => {
                    if (!this.flatData[rowKey]) {
                        this.$set(this.flatData, rowKey, { x: rowKey, values: [value] });
                    } else {
                        this.flatData[rowKey].values.push(value);
                    }
                });
            }
        },
        download() {
            let string = `# EKINNONO ${new Date()}\n# Normalized Y mean for files; ${Object.keys(this.fileData).join(', ')}.\n\n`;
            string += `X\tmean\n`;

            Object.entries(this.flatData).forEach(([x, data]) => {
                const mean = this.arrayMean(data.values);
                string += `${x}\t${mean.toFixed(6)}\n`;
            });

            const blob = new Blob([string], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `ekinnono_${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        async readFile(file) {
            const text = await file.text();
            const rows = text.split('\n')
                .filter(line => !line.startsWith('#'))
                .map(line => line.trim().split(/\s+/).map(Number))
                .filter(row => row.length === 2 && !isNaN(row[0]) && !isNaN(row[1]));

            const yValues = rows.map(row => row[1]);
            const minVal = Math.min(...yValues);
            const maxVal = Math.max(...yValues);

            return Object.fromEntries(rows.map(row => [
                row[0],
                this.normalize(row[1], minVal, maxVal)
            ]));
        },
        normalize(val, min, max) {
            if (min === max) return 0; // Avoid division by zero
            return (val - min) / (max - min);
        },
        arrayMean(arr) {
            const sum = arr.reduce((a, b) => a + b, 0);
            return sum / arr.length;
        },
    },
};
</script>