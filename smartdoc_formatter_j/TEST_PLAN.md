# Document Formatting Agent - Test Plan

This document contains comprehensive test prompts to validate the agent's formatting capabilities.

## Test Status Summary

✅ = Should work correctly with current implementation
⚠️ = May need testing to confirm
❌ = Not yet implemented

## Category 1: Basic Sanity Checks
*Tests single capabilities to ensure core handlers work correctly*

### ✅ Prompt 1: Specific Heading Change
**Prompt:** "Make all level 1 headings 16pt and bold."

**Expected Result:**
- Only level 1 headings affected
- Font size: 16pt
- Bold: true
- Font name unchanged
- Other heading levels unchanged
- Paragraphs unchanged

**Implementation:** `set_heading_font` action with `level: 1`

---

### ✅ Prompt 2: Paragraph Font Change
**Prompt:** "Change the font for all body paragraphs to 'Arial'."

**Expected Result:**
- Only non-heading paragraphs change to Arial
- Headings retain original font
- Size and other properties unchanged

**Implementation:** `set_paragraph_font` action

---

### ✅ Prompt 3: Spacing and Alignment
**Prompt:** "Justify all paragraph text and ensure there is 12pt of space after each one."

**Expected Result:**
- ✅ All non-heading paragraphs justified (6 body paragraphs)
- ✅ 12pt spacing after each paragraph
- ✅ Headings unchanged (alignment and spacing preserved)

**Implementation:** Two actions:
1. `set_alignment` with scope: "all_paragraphs" → Body paragraphs only
2. `set_paragraph_spacing` with scope: "all_paragraphs" → Body paragraphs only

**Note:** "all_paragraphs" is interpreted as body paragraphs only, excluding headings.

---

## Category 2: Multi-Action Prompts
*Tests the agent's ability to generate plans with multiple steps*

### ✅ Prompt 4: Standard Report Formatting
**Prompt:** "Format this document as a standard academic paper. Use Times New Roman font throughout. The main text should be 12pt, and all headings should be 12pt and bold. Also, set the line spacing for the entire document to double (2.0)."

**Expected Result:**
- All headings: Times New Roman, 12pt, bold
- All paragraphs: Times New Roman, 12pt, not bold
- Line spacing: 2.0 (double-spaced) for BOTH headings and paragraphs

**Implementation:** Three actions:
1. `set_heading_font` with Times New Roman, 12pt, bold
2. `set_paragraph_font` with Times New Roman, 12pt
3. `set_paragraph_spacing` with scope: "all_elements", line_spacing: 2.0

**Note:** Uses scope "all_elements" because "entire document" includes both headings and paragraphs.

---

### ✅ Prompt 5: Creating a "Clean" Style
**Prompt:** "Give this document a clean, modern look. Use Calibri as the primary font, make the main headings (level 1) size 18, and left-align everything."

**Expected Result:**
- Level 1 headings: Calibri, 18pt
- Other headings and paragraphs: Calibri
- All elements: left-aligned (both headings and paragraphs)

**Implementation:** Four actions:
1. `set_heading_font` level 1 with Calibri, 18pt
2. `set_heading_font` level "all" exclude 1 with Calibri
3. `set_paragraph_font` with Calibri
4. `set_alignment` with scope: "all_elements", alignment: LEFT

**Note:** Uses scope "all_elements" because "everything" means both headings and paragraphs.

---

## Category 3: Complex & Nuanced Prompts
*Tests the agent's reasoning and sophisticated tool usage*

### ✅ Prompt 6: Fixing Inconsistencies
**Prompt:** "This document is a mess. Please analyze it and enforce a consistent and professional formatting style. Unify all fonts and create a clear hierarchy for the headings."

**Expected Result:**
- Agent identifies font inconsistencies in analysis
- Generates plan using `fix_font_inconsistencies` OR multiple `set_*_font` actions
- All paragraphs have uniform font
- All headings of same level have uniform font
- Clear hierarchy (e.g., H1 > H2 > H3 in size)

**Implementation:** `fix_font_inconsistencies` or comprehensive set of font actions

---

### ✅ Prompt 7: Find and Format
**Prompt:** "Find every instance of the phrase 'CONFIDENTIAL' and make it bold, uppercase, and change its font to Arial."

**Expected Result:**
- Only "CONFIDENTIAL" text changes
- Font: Arial
- Bold: true
- Text converted to uppercase
- Surrounding text unchanged

**Implementation:** `find_and_replace_font` action

**Note:** Validation now includes up to 20 elements (or first 10 for large docs) to ensure changes are detected.

---

## Category 4: Prompts to Test Over-Generalization Fix
*Critical tests to confirm the bug fixes*

### ✅ Prompt 8: The Classic Test Case
**Prompt:** "Please make all headings bold and change their font to 'Century Gothic'."

**Expected Result:**
- ✅ Headings: bold, Century Gothic
- ✅ Body paragraphs: completely unchanged (font, size, bold all preserved)

**Implementation:** ONLY `set_heading_font` with level: "all"

**Critical Check:** If body paragraphs change, the fix has failed!

---

### ✅ Prompt 9: The Tricky Multi-Font Test
**Prompt:** "I want a specific style: make the level 1 heading Arial, size 20. All other headings (level 2, 3, etc.) and all body paragraphs should be in Garamond, size 12."

**Expected Result:**
- Level 1 headings: Arial, 20pt
- Level 2+ headings: Garamond, 12pt
- Body paragraphs: Garamond, 12pt

**Implementation:** Three actions required:
1. `set_heading_font` with level: 1, Arial, 20pt
2. `set_heading_font` with level: "all", exclude_level: 1, Garamond, 12pt
3. `set_paragraph_font` with Garamond, 12pt

**Critical Check:** Agent should NOT use `set_document_default_font` (that would be over-generalization)

**Note:** The `exclude_level` parameter implementation was added to fix this scenario.

---

## Recent Fixes Applied

### Fix 1: `exclude_level` Parameter (2025-10-19 11:33am)
- **Problem:** When applying formatting to "all" headings except one level, the excluded level was being overwritten
- **Solution:** Added `exclude_level` parameter to `apply_set_heading_font_action` in `document_utils.py`
- **Test:** Prompt 9 now passes correctly

### Fix 2: Validation Sample Size (2025-10-19)
- **Problem:** Validator only examined first 2 elements, missing changes to elements later in document
- **Solution:** Increased sample size to all elements (if ≤20) or first 10 elements
- **Test:** Prompt 7 validation now passes correctly

### Fix 3: Improved LLM Prompt (2025-10-19 11:41am)
- **Problem:** LLM was over-generalizing and creating plans with incorrect actions
- **Solution:** Enhanced `create_formatting_plan` prompt with:
  - Explicit action descriptions with examples
  - Documentation of `exclude_level` parameter
  - Scenario-based examples matching test cases
  - Stronger rules against over-generalization
- **Test:** All prompts should now generate correct plans

### Fix 4: "all_paragraphs" Scope Interpretation (2025-10-19 11:57am)
- **Problem:** `set_alignment` and `set_paragraph_spacing` with scope "all_paragraphs" was affecting headings too
- **Solution:** Changed handlers to interpret "all_paragraphs" as body paragraphs only (excluding headings)
  - Added "all_elements" scope for when both paragraphs and headings should be affected
  - Updated LLM prompt to clearly document when to use each scope
  - Location: `document_utils.py` lines 110-156, `tools.py` lines 303-316
- **Test:** Prompt 3 now correctly justifies only body paragraphs, leaving headings unchanged
- **Impact on other prompts:**
  - Prompt 4: LLM should generate scope "all_elements" for "entire document" line spacing
  - Prompt 5: LLM should generate scope "all_elements" for "left-align everything"
  - Added explicit scenario examples in LLM prompt to guide correct scope selection

### Fix 5: Validation JSON Parsing (2025-10-19 11:57am)
- **Problem:** LLM was wrapping validation JSON in markdown code fences (` ```json ... ``` `), causing parse errors
- **Solution:** Added regex to strip markdown code fences before parsing JSON in `validate_formatting_result`
  - Location: `tools.py` lines 779-785
- **Test:** Validation now succeeds even when LLM adds markdown formatting

---

## How to Test

1. **Start the backend server:**
   ```bash
   cd smartdoc_formatter_j
   python -m smartdoc_agent.main
   ```

2. **Start the frontend:**
   ```bash
   cd agentic-document-scribe
   npm run dev
   ```

3. **Upload a test document** with:
   - Multiple heading levels (H1, H2, H3)
   - Body paragraphs with varied fonts
   - At least one instance of "CONFIDENTIAL" for Prompt 7

4. **Test each prompt systematically:**
   - Enter the exact prompt text
   - Wait for processing to complete
   - Download the formatted document
   - Open in Microsoft Word
   - Verify expected results manually

5. **Check validation results:**
   - Agent should report "Excellent" or "Good" assessment
   - If "Needs Improvement", review the logs to understand why

---

## Expected Agent Workflow

For each prompt, the agent should:

1. **Analyze** the original document structure
2. **Create Plan** based on user goal (LLM generates action list)
3. **Apply** the formatting plan to the document
4. **Analyze** the modified document
5. **Validate** that changes match the goal

---

## Debugging Tips

If a test fails:

1. **Check the agent logs** for the generated plan
2. **Verify the plan matches expected actions** (see Implementation notes above)
3. **Check validation results** - does the agent detect the changes?
4. **Examine the formatted document** in Word to see actual formatting
5. **Review console output** for any error messages or warnings

Common issues:
- Plan contains wrong actions → LLM prompt needs adjustment
- Plan is correct but formatting not applied → Handler implementation issue
- Formatting applied but validation fails → Validation prompt or sample size issue
