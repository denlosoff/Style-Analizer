
export function downloadJson(data: object, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function uploadJson<T>(): Promise<T> {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const result = JSON.parse(e.target?.result as string);
                        resolve(result as T);
                    } catch (error) {
                        reject(new Error('Error parsing JSON file.'));
                    }
                };
                reader.onerror = () => {
                    reject(new Error('Error reading file.'));
                };
                reader.readAsText(file);
            } else {
                reject(new Error('No file selected.'));
            }
        };

        input.click();
    });
}
