/**
 * FeatureSpecExporter - Export Feature Specs với đầy đủ thông tin
 * 
 * Supports:
 * - XLSX với multiple sheets (Overview, Scope, Technical, Tasks, TestCases, QA)
 * - PDF với tách trang theo sections
 * 
 * @module admin/feature-registry
 */

import * as XLSX from 'xlsx';

// ========== HELPERS ==========

const safeString = (val) => {
  if (val === null || val === undefined) return '';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
};

const formatArrayToList = (arr, key = null) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
  if (key) {
    return arr.map((item, idx) => `${idx + 1}. ${item[key] || JSON.stringify(item)}`).join('\n');
  }
  return arr.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
};

// ========== XLSX EXPORT ==========

/**
 * Export specs to XLSX with multiple sheets
 */
export const exportToXLSX = (specs) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Overview (Tổng quan)
  const overviewData = specs.map(s => ({
    'FCode': s.fcode,
    'Tên': s.name,
    'Module': s.module,
    'Loại': s.type,
    'Trạng thái': s.status,
    'Ưu tiên': s.priority || '',
    'Tiến độ (%)': s.progress || 0,
    'Phase': s.phase || '',
    'Milestone': s.milestone || '',
    'Owner Product': s.owner_product || '',
    'Owner Tech': s.owner_tech || '',
    'Assignees': (s.assignees || []).join(', '),
    'Ngày bắt đầu DK': formatDate(s.target_start),
    'Ngày kết thúc DK': formatDate(s.target_end),
    'Ngày bắt đầu TT': formatDate(s.actual_start),
    'Ngày kết thúc TT': formatDate(s.actual_end),
    'Mục tiêu': s.objective || '',
    'Vấn đề': s.problem || '',
    'Giải pháp': s.solution_algorithm || '',
    'Giá trị User': s.value_user || '',
    'Giá trị System': s.value_system || '',
    'Giá trị Business': s.value_business || '',
    'Mô tả ngắn': s.short_description || '',
    'Tags': (s.tags || []).join(', ')
  }));
  const wsOverview = XLSX.utils.json_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, wsOverview, 'Tổng quan');

  // Sheet 2: Scope (Phạm vi)
  const scopeData = specs.map(s => ({
    'FCode': s.fcode,
    'Tên': s.name,
    'Trong phạm vi': formatArrayToList(s.in_scope),
    'Ngoài phạm vi': formatArrayToList(s.out_scope),
    'Tiêu chí thành công': formatArrayToList(s.success_metrics, 'kpi'),
    'Acceptance Criteria': formatArrayToList(s.acceptance_criteria),
    'Impacted: User UI': s.impacted_areas?.user_ui ? 'Yes' : 'No',
    'Impacted: Admin UI': s.impacted_areas?.admin_ui ? 'Yes' : 'No',
    'Impacted: Data/DB': s.impacted_areas?.data_db ? 'Yes' : 'No',
    'Impacted: API': s.impacted_areas?.api_functions ? 'Yes' : 'No',
    'Impacted: Auth': s.impacted_areas?.auth_permissions ? 'Yes' : 'No',
    'Impacted: Analytics': s.impacted_areas?.analytics ? 'Yes' : 'No',
    'Impacted: Notification': s.impacted_areas?.notification_email ? 'Yes' : 'No'
  }));
  const wsScope = XLSX.utils.json_to_sheet(scopeData);
  XLSX.utils.book_append_sheet(workbook, wsScope, 'Phạm vi');

  // Sheet 3: Technical (Kỹ thuật)
  const techData = specs.map(s => ({
    'FCode': s.fcode,
    'Tên': s.name,
    'Mô tả chi tiết': s.detail_description || '',
    'Yêu cầu chức năng (FR)': formatArrayToList(s.functional_requirements, 'description'),
    'NFR - Performance': s.non_functional_requirements?.performance || '',
    'NFR - Security': s.non_functional_requirements?.security || '',
    'NFR - Reliability': s.non_functional_requirements?.reliability || '',
    'NFR - Accessibility': s.non_functional_requirements?.accessibility || '',
    'Ghi chú kiến trúc': s.architecture_notes || '',
    'Modules liên quan': (s.modules_involved || []).join('\n'),
    'Entities affected': (s.entities_affected || []).join(', '),
    'API/Functions': formatArrayToList(s.api_functions, 'name'),
    'Hooks/Services': (s.hooks_services || []).join(', '),
    'UI Components used': (s.ui_components_used || []).join(', '),
    'UI Components new': (s.ui_components_new || []).join(', '),
    'Events emitted': (s.events_emitted || []).join(', '),
    'Design/Mockup URL': s.design_mockup_url || '',
    'UX Notes': s.ux_notes || '',
    'Backward Compatible': s.backward_compatible ? 'Yes' : 'No',
    'Migration Required': s.migration_required ? 'Yes' : 'No',
    'Feature Flag Key': s.feature_flag_key || '',
    'Dependencies (FCodes)': (s.dependencies || []).join(', '),
    'Assumptions': formatArrayToList(s.assumptions)
  }));
  const wsTech = XLSX.utils.json_to_sheet(techData);
  XLSX.utils.book_append_sheet(workbook, wsTech, 'Kỹ thuật');

  // Sheet 4: Tasks
  const tasksData = [];
  specs.forEach(s => {
    (s.tasks || []).forEach(t => {
      tasksData.push({
        'FCode': s.fcode,
        'Feature': s.name,
        'Task ID': t.id || '',
        'Tiêu đề': t.title || '',
        'Loại': t.type || '',
        'Phase': t.phase || '',
        'Estimate': t.estimate || '',
        'Owner': t.owner || '',
        'Status': t.status || 'todo',
        'Files': (t.files || []).join('\n'),
        'Steps': (t.steps || []).join('\n'),
        'Definition of Done': (t.dod || []).join('\n')
      });
    });
  });
  if (tasksData.length === 0) {
    tasksData.push({ 'FCode': '', 'Feature': '', 'Task ID': 'Không có tasks' });
  }
  const wsTasks = XLSX.utils.json_to_sheet(tasksData);
  XLSX.utils.book_append_sheet(workbook, wsTasks, 'Tasks');

  // Sheet 5: Test Cases
  const testCasesData = [];
  specs.forEach(s => {
    (s.test_cases || []).forEach(tc => {
      testCasesData.push({
        'FCode': s.fcode,
        'Feature': s.name,
        'TC ID': tc.id || '',
        'Scenario': tc.scenario || '',
        'Steps': tc.steps || '',
        'Expected': tc.expected || '',
        'Status': tc.status || 'pending'
      });
    });
  });
  if (testCasesData.length === 0) {
    testCasesData.push({ 'FCode': '', 'Feature': '', 'TC ID': 'Không có test cases' });
  }
  const wsTestCases = XLSX.utils.json_to_sheet(testCasesData);
  XLSX.utils.book_append_sheet(workbook, wsTestCases, 'Test Cases');

  // Sheet 6: QA & Logs
  const qaData = specs.map(s => ({
    'FCode': s.fcode,
    'Tên': s.name,
    'Version Introduced': s.version_introduced || '',
    'Version Released': s.version_released || '',
    'Rollout Strategy': s.rollout_strategy?.stages ? 
      s.rollout_strategy.stages.map(st => `${st.name}: ${st.percentage}% (${st.status})`).join('\n') : '',
    'Rollback Condition': s.rollout_strategy?.rollback_condition || '',
    'Rollback Method': s.rollout_strategy?.rollback_method || '',
    'Risks': (s.risks || []).map(r => `[${r.type}] ${r.description} (Impact: ${r.impact}, Likelihood: ${r.likelihood})`).join('\n'),
    'Mitigations': (s.risks || []).map(r => r.mitigation).filter(Boolean).join('\n'),
    'Changelogs': (s.changelogs || []).map(c => `${c.version} (${formatDate(c.date)}): ${c.changes}`).join('\n'),
    'PR/Commits': (s.pr_commits || []).join('\n'),
    'Related FCodes': (s.related_fcodes || []).join(', '),
    'Documentation Links': (s.documentation_links || []).join('\n'),
    'Decisions': (s.decisions || []).map(d => `${formatDate(d.date)}: ${d.decision} (${d.reason})`).join('\n'),
    'Notes': s.notes || ''
  }));
  const wsQA = XLSX.utils.json_to_sheet(qaData);
  XLSX.utils.book_append_sheet(workbook, wsQA, 'QA & Logs');

  // Write and download
  const fileName = `feature-specs-full-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return { success: true, count: specs.length, fileName };
};

// ========== PDF EXPORT ==========

/**
 * Generate comprehensive PDF HTML for a list of specs
 */
export const generatePDFHTML = (specs) => {
  const styles = `
    <style>
      @page { size: A4; margin: 20mm; }
      @media print {
        .page-break { page-break-before: always; }
        .no-break { page-break-inside: avoid; }
      }
      * { box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Arial, sans-serif; 
        font-size: 11px; 
        line-height: 1.5;
        color: #333;
        padding: 20px;
      }
      h1 { color: #7C3AED; font-size: 24px; border-bottom: 3px solid #7C3AED; padding-bottom: 8px; margin-bottom: 16px; }
      h2 { color: #5B21B6; font-size: 18px; margin-top: 24px; border-left: 4px solid #7C3AED; padding-left: 12px; }
      h3 { color: #6B7280; font-size: 14px; margin-top: 16px; font-weight: 600; }
      .section { margin-bottom: 20px; }
      .spec-header { 
        background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); 
        color: white; 
        padding: 16px; 
        border-radius: 8px;
        margin-bottom: 16px;
      }
      .spec-header h2 { color: white; border: none; padding: 0; margin: 0 0 8px 0; }
      .spec-header .meta { font-size: 12px; opacity: 0.9; }
      .badge { 
        display: inline-block; 
        padding: 2px 8px; 
        border-radius: 4px; 
        font-size: 10px; 
        font-weight: 600;
        margin-right: 4px;
      }
      .badge-status { background: #DBEAFE; color: #1E40AF; }
      .badge-priority { background: #FEE2E2; color: #991B1B; }
      .badge-module { background: #D1FAE5; color: #065F46; }
      .badge-progress { background: #E0E7FF; color: #3730A3; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; font-size: 10px; }
      th { background-color: #F3F4F6; font-weight: 600; color: #374151; }
      tr:nth-child(even) { background-color: #F9FAFB; }
      .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 12px 0; }
      .info-item { background: #F9FAFB; padding: 10px; border-radius: 6px; border: 1px solid #E5E7EB; }
      .info-label { font-weight: 600; color: #6B7280; font-size: 9px; text-transform: uppercase; }
      .info-value { color: #111827; margin-top: 4px; }
      .list { margin: 8px 0; padding-left: 20px; }
      .list li { margin-bottom: 4px; }
      .task-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 10px; margin: 8px 0; }
      .task-header { display: flex; justify-content: space-between; align-items: center; }
      .task-title { font-weight: 600; color: #111827; }
      .task-status { padding: 2px 8px; border-radius: 4px; font-size: 9px; }
      .task-status.done { background: #D1FAE5; color: #065F46; }
      .task-status.in_progress { background: #FEF3C7; color: #92400E; }
      .task-status.todo { background: #E5E7EB; color: #374151; }
      .test-case { border-left: 3px solid #7C3AED; padding-left: 12px; margin: 10px 0; }
      .test-status { font-weight: 600; }
      .test-status.passed { color: #059669; }
      .test-status.failed { color: #DC2626; }
      .test-status.pending { color: #6B7280; }
      .risk { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 6px; padding: 10px; margin: 8px 0; }
      .risk-header { font-weight: 600; color: #991B1B; }
      .changelog { border-left: 3px solid #10B981; padding-left: 12px; margin: 8px 0; }
      .toc { background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
      .toc-item { margin: 4px 0; }
      .summary-box { background: #EDE9FE; border: 1px solid #C4B5FD; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
      .footer { text-align: center; color: #9CA3AF; font-size: 10px; margin-top: 24px; padding-top: 12px; border-top: 1px solid #E5E7EB; }
    </style>
  `;

  const generateSpecHTML = (spec, index, total) => {
    const tasks = spec.tasks || [];
    const testCases = spec.test_cases || [];
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const passedTests = testCases.filter(tc => tc.status === 'passed').length;

    return `
      <div class="${index > 0 ? 'page-break' : ''}">
        <!-- Header -->
        <div class="spec-header no-break">
          <h2>${spec.fcode} - ${spec.name}</h2>
          <div class="meta">
            <span class="badge badge-module">${spec.module}</span>
            <span class="badge badge-status">${spec.status}</span>
            <span class="badge badge-priority">${spec.priority || 'N/A'}</span>
            <span class="badge badge-progress">${spec.progress || 0}%</span>
            <span style="margin-left: 12px;">Feature ${index + 1} / ${total}</span>
          </div>
        </div>

        <!-- Tab 1: Tổng quan -->
        <div class="section no-break">
          <h2>📋 Tổng quan</h2>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Mục tiêu</div>
              <div class="info-value">${spec.objective || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Vấn đề cần giải quyết</div>
              <div class="info-value">${spec.problem || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phase / Milestone</div>
              <div class="info-value">${spec.phase || 'N/A'} / ${spec.milestone || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Owners</div>
              <div class="info-value">Product: ${spec.owner_product || 'N/A'} | Tech: ${spec.owner_tech || 'N/A'}</div>
            </div>
          </div>

          <h3>Giải pháp / Algorithm</h3>
          <p>${(spec.solution_algorithm || 'N/A').replace(/\n/g, '<br>')}</p>

          <h3>Giá trị mang lại</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Cho User</div>
              <div class="info-value">${spec.value_user || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Cho System</div>
              <div class="info-value">${spec.value_system || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Cho Business</div>
              <div class="info-value">${spec.value_business || 'N/A'}</div>
            </div>
          </div>

          ${spec.success_metrics?.length ? `
            <h3>Success Metrics</h3>
            <table>
              <thead><tr><th>KPI</th><th>Baseline</th><th>Target</th></tr></thead>
              <tbody>
                ${spec.success_metrics.map(m => `<tr><td>${m.kpi}</td><td>${m.baseline || 'N/A'}</td><td>${m.target || 'N/A'}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}
        </div>

        <!-- Tab 2: Phạm vi -->
        <div class="section no-break">
          <h2>🎯 Phạm vi</h2>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Trong phạm vi</div>
              <div class="info-value">
                ${spec.in_scope?.length ? `<ul class="list">${spec.in_scope.map(i => `<li>${i}</li>`).join('')}</ul>` : 'N/A'}
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Ngoài phạm vi</div>
              <div class="info-value">
                ${spec.out_scope?.length ? `<ul class="list">${spec.out_scope.map(i => `<li>${i}</li>`).join('')}</ul>` : 'N/A'}
              </div>
            </div>
          </div>

          ${spec.acceptance_criteria?.length ? `
            <h3>Acceptance Criteria</h3>
            <ul class="list">
              ${spec.acceptance_criteria.map(ac => `<li>${ac}</li>`).join('')}
            </ul>
          ` : ''}

          <h3>Impacted Areas</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${spec.impacted_areas?.user_ui ? '<span class="badge badge-module">User UI</span>' : ''}
            ${spec.impacted_areas?.admin_ui ? '<span class="badge badge-module">Admin UI</span>' : ''}
            ${spec.impacted_areas?.data_db ? '<span class="badge badge-module">Data/DB</span>' : ''}
            ${spec.impacted_areas?.api_functions ? '<span class="badge badge-module">API</span>' : ''}
            ${spec.impacted_areas?.auth_permissions ? '<span class="badge badge-module">Auth</span>' : ''}
            ${spec.impacted_areas?.analytics ? '<span class="badge badge-module">Analytics</span>' : ''}
            ${spec.impacted_areas?.notification_email ? '<span class="badge badge-module">Notification</span>' : ''}
            ${!Object.values(spec.impacted_areas || {}).some(Boolean) ? '<span class="badge">None specified</span>' : ''}
          </div>
        </div>

        <!-- Tab 3: Kỹ thuật -->
        <div class="section">
          <h2>⚙️ Kỹ thuật</h2>
          
          ${spec.detail_description ? `
            <h3>Mô tả chi tiết</h3>
            <p>${spec.detail_description.replace(/\n/g, '<br>')}</p>
          ` : ''}

          ${spec.functional_requirements?.length ? `
            <h3>Functional Requirements</h3>
            <table>
              <thead><tr><th>ID</th><th>Description</th></tr></thead>
              <tbody>
                ${spec.functional_requirements.map(fr => `<tr><td>${fr.id || '-'}</td><td>${fr.description}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${spec.non_functional_requirements ? `
            <h3>Non-Functional Requirements</h3>
            <div class="info-grid">
              ${spec.non_functional_requirements.performance ? `<div class="info-item"><div class="info-label">Performance</div><div class="info-value">${spec.non_functional_requirements.performance}</div></div>` : ''}
              ${spec.non_functional_requirements.security ? `<div class="info-item"><div class="info-label">Security</div><div class="info-value">${spec.non_functional_requirements.security}</div></div>` : ''}
              ${spec.non_functional_requirements.reliability ? `<div class="info-item"><div class="info-label">Reliability</div><div class="info-value">${spec.non_functional_requirements.reliability}</div></div>` : ''}
              ${spec.non_functional_requirements.accessibility ? `<div class="info-item"><div class="info-label">Accessibility</div><div class="info-value">${spec.non_functional_requirements.accessibility}</div></div>` : ''}
            </div>
          ` : ''}

          <h3>Technical Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Modules Involved</div>
              <div class="info-value">${spec.modules_involved?.join(', ') || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Entities Affected</div>
              <div class="info-value">${spec.entities_affected?.join(', ') || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Feature Flag</div>
              <div class="info-value">${spec.feature_flag_key || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Dependencies</div>
              <div class="info-value">${spec.dependencies?.join(', ') || 'None'}</div>
            </div>
          </div>

          ${spec.architecture_notes ? `
            <h3>Architecture Notes</h3>
            <p>${spec.architecture_notes.replace(/\n/g, '<br>')}</p>
          ` : ''}
        </div>

        <!-- Tab 4: Tasks -->
        <div class="section">
          <h2>📝 Tasks (${completedTasks}/${tasks.length} completed)</h2>
          
          ${tasks.length > 0 ? tasks.map(task => `
            <div class="task-card no-break">
              <div class="task-header">
                <span class="task-title">${task.id || ''} - ${task.title}</span>
                <span class="task-status ${task.status || 'todo'}">${task.status || 'todo'}</span>
              </div>
              <div style="margin-top: 8px; font-size: 10px; color: #6B7280;">
                <strong>Type:</strong> ${task.type || 'N/A'} | 
                <strong>Phase:</strong> ${task.phase || 'N/A'} | 
                <strong>Estimate:</strong> ${task.estimate || 'N/A'} |
                <strong>Owner:</strong> ${task.owner || 'N/A'}
              </div>
              ${task.files?.length ? `<div style="margin-top: 4px; font-size: 10px;"><strong>Files:</strong> ${task.files.join(', ')}</div>` : ''}
              ${task.dod?.length ? `
                <div style="margin-top: 4px; font-size: 10px;">
                  <strong>Definition of Done:</strong>
                  <ul style="margin: 4px 0 0 16px; padding: 0;">
                    ${task.dod.map(d => `<li>${d}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('') : '<p>Không có tasks</p>'}
        </div>

        <!-- Tab 5: Test Cases -->
        <div class="section">
          <h2>🧪 Test Cases (${passedTests}/${testCases.length} passed)</h2>
          
          ${testCases.length > 0 ? testCases.map(tc => `
            <div class="test-case no-break">
              <div style="display: flex; justify-content: space-between;">
                <strong>${tc.id || ''} - ${tc.scenario}</strong>
                <span class="test-status ${tc.status || 'pending'}">${tc.status || 'pending'}</span>
              </div>
              <div style="margin-top: 8px;">
                <div><strong>Steps:</strong></div>
                <p style="margin: 4px 0; white-space: pre-wrap;">${tc.steps || 'N/A'}</p>
              </div>
              <div style="margin-top: 8px;">
                <div><strong>Expected:</strong></div>
                <p style="margin: 4px 0; white-space: pre-wrap;">${tc.expected || 'N/A'}</p>
              </div>
            </div>
          `).join('') : '<p>Không có test cases</p>'}
        </div>

        <!-- Tab 6: QA & Logs -->
        <div class="section">
          <h2>📊 QA & Logs</h2>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Version Introduced</div>
              <div class="info-value">${spec.version_introduced || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Version Released</div>
              <div class="info-value">${spec.version_released || 'N/A'}</div>
            </div>
          </div>

          ${spec.risks?.length ? `
            <h3>Risks</h3>
            ${spec.risks.map(r => `
              <div class="risk no-break">
                <div class="risk-header">[${r.type}] ${r.description}</div>
                <div style="margin-top: 4px; font-size: 10px;">
                  Impact: <strong>${r.impact}</strong> | Likelihood: <strong>${r.likelihood}</strong>
                </div>
                ${r.mitigation ? `<div style="margin-top: 4px; font-size: 10px;"><strong>Mitigation:</strong> ${r.mitigation}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}

          ${spec.changelogs?.length ? `
            <h3>Changelog</h3>
            ${spec.changelogs.map(c => `
              <div class="changelog no-break">
                <strong>${c.version}</strong> (${formatDate(c.date)})<br>
                ${c.changes}
              </div>
            `).join('')}
          ` : ''}

          ${spec.decisions?.length ? `
            <h3>Key Decisions</h3>
            ${spec.decisions.map(d => `
              <div class="changelog no-break">
                <strong>${formatDate(d.date)}</strong>: ${d.decision}<br>
                <em>Reason: ${d.reason}</em>
              </div>
            `).join('')}
          ` : ''}

          ${spec.notes ? `
            <h3>Notes</h3>
            <p>${spec.notes.replace(/\n/g, '<br>')}</p>
          ` : ''}
        </div>
      </div>
    `;
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Feature Specs Report</title>
      ${styles}
    </head>
    <body>
      <!-- Cover Page -->
      <div class="summary-box">
        <h1 style="margin: 0; text-align: center;">Feature Specs Report</h1>
        <p style="text-align: center; color: #6B7280;">
          Generated: ${new Date().toLocaleString('vi-VN')}<br>
          Total: ${specs.length} feature specs
        </p>
      </div>

      <!-- Table of Contents -->
      <div class="toc no-break">
        <h3 style="margin-top: 0;">📑 Table of Contents</h3>
        ${specs.map((s, i) => `
          <div class="toc-item">${i + 1}. <strong>${s.fcode}</strong> - ${s.name} 
            <span class="badge badge-status">${s.status}</span>
            <span class="badge badge-progress">${s.progress || 0}%</span>
          </div>
        `).join('')}
      </div>

      <!-- Feature Specs -->
      ${specs.map((s, i) => generateSpecHTML(s, i, specs.length)).join('')}

      <!-- Footer -->
      <div class="footer">
        Feature Control Tower Export | Generated by Base44 Platform | ${new Date().toISOString()}
      </div>
    </body>
    </html>
  `;

  return html;
};

/**
 * Open PDF print preview
 */
export const exportToPDF = (specs) => {
  const html = generatePDFHTML(specs);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);

  return { success: true, count: specs.length };
};