import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browser=await chromium.launch({headless:true,chromiumSandbox:true});
const results=[];
try {
  for (const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:width===390?844:1000}});
    for (const route of ['/','/es/','/catalogue/','/es/catalogo/','/contact/','/es/contacto/','/products/walnut/','/faq/','/privacy/']) {
      await page.goto('http://127.0.0.1:4321'+route,{waitUntil:'networkidle'});
      if(route==='/contact/') {
        await page.locator('[data-product-picker] summary').click();
        await page.getByLabel('Walnut',{exact:true}).check();
      }
      await page.evaluate(await readFile(path.join(root,'artifacts/qa/node_modules/axe-core/axe.min.js'),'utf8'));
      const r=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));
      results.push({width,route,violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))})),passes:r.passes.length,incomplete:r.incomplete.length,incompleteDetails:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))}))});
    }
    await page.close();
  }
} finally { await browser.close(); }
const report={passed:results.every(r=>!r.violations.length),pageViewportChecks:results.length,results};
await writeFile(path.join(root,'artifacts/accessibility-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exitCode=report.passed?0:1;
