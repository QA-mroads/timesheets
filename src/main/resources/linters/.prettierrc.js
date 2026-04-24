module.exports = {
    arrowParens: 'avoid',
    endOfLine: 'lf',
    semi: false,
    trailingComma: 'all',
    singleQuote: true,
    printWidth: 120,
    tabWidth: 4,
    bracketSameLine: false,
    overrides: [
        {
            files: 'src/**/*.ts',
            options: {
                printWidth: 250,
            },
        },
    ],
}
