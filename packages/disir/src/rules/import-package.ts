import { AbstractRule, Replacement } from '@fimbul/wotan';
import { findImports, ImportKind } from 'tsutils';
import * as ts from 'typescript';
import * as path from 'path';

export class Rule extends AbstractRule {
    public apply() {
        const dirname = path.dirname(this.sourceFile.fileName);
        const currentPackage = getPackageName(dirname);
        for (const name of findImports(this.sourceFile, ImportKind.AllStaticImports)) {
            if (!ts.isExternalModuleNameRelative(name.text))
                continue;
            const importedPackage = getPackageName(path.resolve(dirname, name.text));
            if (importedPackage !== currentPackage) {
                const start = name.getStart(this.sourceFile);
                this.addFailure(
                    start,
                    name.end,
                    `Import directly from '@fimbul/${importedPackage}'.`,
                    Replacement.replace(start + 1, name.end - 1, `@fimbul/${importedPackage}`),
                );
            }
        }
    }
}

function getPackageName(fileName: string): string {
    const parts = fileName.split(path.sep);
    return parts[parts.lastIndexOf('packages') + 1];
}
