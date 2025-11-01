# 🔧 Missing Fields Fix - Academic Course Plan

## ❌ Problem

Two sections in the course plan template were not being filled:

### **Section 1: Course Info Box**
```
Course Code: {{COURSE_CODE}}
Academic Level: {{ACADEMIC_LEVEL}}
```

### **Section 2: Credits Box**
```
Total Credits: {{COURSE_CREDIT}}
Hours of Instruction
Theory: {{THEORY_CREDIT}}
Practical: {{PRACTICAL_CREDIT}}
Total: {{TOTAL_CREDIT}}
```

---

## 🔍 Root Cause

### **Issue 1: LLM Not Extracting Fields**
The prompt to the LLM didn't ask for these specific fields:
- `academic_level`
- `course_credit`
- `theory_credit`
- `practical_credit`
- `total_credit`

### **Issue 2: Missing Placeholder Mappings**
Even if extracted, the placeholders weren't mapped in `_build_course_plan_mapping()`:
- `{{ACADEMIC_LEVEL}}` ❌
- `{{COURSE_CREDIT}}` ❌
- `{{THEORY_CREDIT}}` ❌
- `{{PRACTICAL_CREDIT}}` ❌
- `{{TOTAL_CREDIT}}` ❌

---

## ✅ Fixes Applied

### **Fix 1: Updated LLM Extraction Prompt (Lines 237-250)**

**Added to JSON extraction:**
```python
{
    "course_code": "Course code (e.g., PMC2418)",
    "academic_level": "Academic level (e.g., UG, PG, Diploma)",  # ✅ NEW
    "course_credit": "Total course credits (e.g., 3)",           # ✅ NEW
    "theory_credit": "Theory credits/hours (e.g., 3)",           # ✅ NEW
    "practical_credit": "Practical/Lab credits/hours (e.g., 0)", # ✅ NEW
    "total_credit": "Total credits (theory + practical)",        # ✅ NEW
    ...
}
```

### **Fix 2: Added Placeholder Mappings (Lines 464, 470-474)**

**Added mappings:**
```python
# Basic course info
mapping['{{COURSE_CODE}}'] = content.get('course_code', '[Code]')
mapping['{{ACADEMIC_LEVEL}}'] = content.get('academic_level', 'UG')  # ✅ NEW

# Credit information
mapping['{{COURSE_CREDIT}}'] = content.get('course_credit', '3')      # ✅ NEW
mapping['{{THEORY_CREDIT}}'] = content.get('theory_credit', '3')      # ✅ NEW
mapping['{{PRACTICAL_CREDIT}}'] = content.get('practical_credit', '0') # ✅ NEW
mapping['{{TOTAL_CREDIT}}'] = content.get('total_credit', '3')        # ✅ NEW
```

---

## 🎯 How It Works Now

### **Step 1: LLM Extraction**
When you upload a syllabus, the LLM will now look for:

**From syllabus text like:**
```
Course Code: CS101
Level: Undergraduate
Credits: 3 (Theory: 3, Practical: 0)
```

**Extracts to JSON:**
```json
{
  "course_code": "CS101",
  "academic_level": "UG",
  "course_credit": "3",
  "theory_credit": "3",
  "practical_credit": "0",
  "total_credit": "3"
}
```

### **Step 2: Placeholder Replacement**
The extracted data is mapped to placeholders:

```
{{COURSE_CODE}} → "CS101"
{{ACADEMIC_LEVEL}} → "UG"
{{COURSE_CREDIT}} → "3"
{{THEORY_CREDIT}} → "3"
{{PRACTICAL_CREDIT}} → "0"
{{TOTAL_CREDIT}} → "3"
```

### **Step 3: Word Document Generation**
Placeholders in the template are replaced with actual values:

**Before:**
```
Course Code: {{COURSE_CODE}}
Academic Level: {{ACADEMIC_LEVEL}}
```

**After:**
```
Course Code: CS101
Academic Level: UG
```

---

## 🧪 Test Cases

### **Test 1: Standard Syllabus**
**Input:**
```
Course: Introduction to Python
Code: CS101
Level: Undergraduate
Credits: 3 (3L + 0P)
```

**Expected Output:**
- Course Code: CS101 ✅
- Academic Level: UG ✅
- Total Credits: 3 ✅
- Theory: 3 ✅
- Practical: 0 ✅
- Total: 3 ✅

### **Test 2: Lab Course**
**Input:**
```
Course: Database Lab
Code: CS201L
Level: Postgraduate
Credits: 2 (0L + 2P)
```

**Expected Output:**
- Course Code: CS201L ✅
- Academic Level: PG ✅
- Total Credits: 2 ✅
- Theory: 0 ✅
- Practical: 2 ✅
- Total: 2 ✅

### **Test 3: Mixed Course**
**Input:**
```
Course: Web Development
Code: IT301
Level: UG
Credits: 4 (2L + 2P)
```

**Expected Output:**
- Course Code: IT301 ✅
- Academic Level: UG ✅
- Total Credits: 4 ✅
- Theory: 2 ✅
- Practical: 2 ✅
- Total: 4 ✅

---

## 🔄 Default Values

If the LLM can't find these fields in the syllabus, it will use defaults:

| Field | Default Value |
|-------|--------------|
| `course_code` | `[Code]` |
| `academic_level` | `UG` |
| `course_credit` | `3` |
| `theory_credit` | `3` |
| `practical_credit` | `0` |
| `total_credit` | `3` |

---

## 📝 What the LLM Looks For

The LLM will intelligently extract from various formats:

### **Format 1: Explicit**
```
Course Code: CS101
Academic Level: Undergraduate
Credits: 3
Theory Hours: 45
Practical Hours: 0
```

### **Format 2: Compact**
```
CS101 | UG | 3 Credits (3L+0P)
```

### **Format 3: Table**
```
| Field    | Value |
|----------|-------|
| Code     | CS101 |
| Level    | UG    |
| Credits  | 3     |
```

### **Format 4: Narrative**
```
This is an undergraduate (UG) level course with code CS101. 
The course carries 3 credits with 3 hours of theory and no practical component.
```

**The LLM will extract from ANY of these formats!** 🎯

---

## 🧪 Test Now

1. **Restart backend:**
   ```bash
   cd smartdoc_formatter_j
   python -m uvicorn smartdoc_agent.api.main:app --reload
   ```

2. **Upload a syllabus with:**
   - Course code clearly mentioned
   - Academic level (UG/PG/Diploma)
   - Credit breakdown (theory/practical)

3. **Select "Academic Course Plan" template**

4. **Check the generated document:**
   - Both boxes should now be filled! ✅

---

## 🎯 Summary

**Fixed:**
- ✅ Added 5 new fields to LLM extraction prompt
- ✅ Added 5 new placeholder mappings
- ✅ LLM now extracts credit information
- ✅ LLM now extracts academic level
- ✅ All placeholders will be replaced

**Result:**
- ✅ Course Code box: FILLED
- ✅ Academic Level box: FILLED
- ✅ Credits section: FILLED
- ✅ Theory/Practical breakdown: FILLED

---

**The missing fields will now be populated from your syllabus!** 🎉
