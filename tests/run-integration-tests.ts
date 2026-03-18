/**
 * EigoMaster 統合テスト実行スクリプト
 * 実行: npx ts-node tests/run-integration-tests.ts
 */

import { IntegrationTestSuite } from './integration-test-suite';

async function main() {
  const suite = new IntegrationTestSuite();
  const report = await suite.runAllTests();

  // コンソールにレポート出力
  suite.printReport();

  // ファイルに保存
  const reportPath = '/Users/80dr/eigomaster/test-results/integration-test-report.json';
  await suite.saveReport(reportPath);

  // 終了コード（テスト失敗時は 1）
  process.exit(report.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('テスト実行エラー:', error);
  process.exit(1);
});
