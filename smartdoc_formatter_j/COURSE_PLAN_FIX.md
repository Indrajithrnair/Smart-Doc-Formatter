# 🔧 Academic Course Plan Template - Fixed

## ❌ Issues Found

### **Issue 1: JSON Parsing Error**
```
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```
**Cause:** LLM returned empty or invalid JSON response

### **Issue 2: UnboundLocalError**
```
UnboundLocalError: cannot access local variable 'datetime' where it is not associated with a value
```
**Cause:** Import statement `import datetime` instead of `from datetime import datetime`

---

## ✅ Fixes Applied

### **Fix 1: Improved JSON Parsing (template_agent.py)**

**Added:**
1. **Debug logging** - See what LLM actually returns
2. **Empty response check** - Catch empty responses before parsing
3. **Better JSON extraction** - Find JSON even if embedded in text
4. **Specific error messages** - Show first 200 chars of failed response

**Changes:**
```python
# Before
basic_content = self._clean_json_response(response.content)
basic_data = json.loads(basic_content)

# After
basic_content = self._clean_json_response(response.content)

# Debug output
print(f"[DEBUG] LLM Response length: {len(basic_content)}")
print(f"[DEBUG] LLM Response (first 500 chars): {basic_content[:500]}")

# Check for empty
if not basic_content or basic_content.strip() == "":
    raise ValueError("LLM returned empty response")

basic_data = json.loads(basic_content)
```

### **Fix 2: Enhanced JSON Cleaning**

**Improved `_clean_json_response()` method:**
```python
def _clean_json_response(self, content: str) -> str:
    if not content:
        return ""
    
    content = content.strip()
    
    # Remove markdown code blocks
    content = re.sub(r'^```json\s*', '', content)
    content = re.sub(r'^```\s*', '', content)
    content = re.sub(r'\s*```$', '', content)
    
    # Find JSON object if embedded in text
    json_match = re.search(r'\{.*\}', content, re.DOTALL)
    if json_match:
        content = json_match.group(0)
    
    return content.strip()
```

**Now handles:**
- Empty responses
- Markdown code blocks (```json)
- JSON embedded in explanatory text
- Extra whitespace

### **Fix 3: Better Error Handling**

```python
except json.JSONDecodeError as e:
    error_msg = f"JSON parsing failed. LLM response was: '{basic_content[:200]}...'"
    print(f"[ERROR] {error_msg}")
    self._emit_progress("error", error_msg)
    raise Exception(f"Course plan extraction failed: Invalid JSON from LLM - {e}")
except Exception as e:
    print(f"[ERROR] Course plan extraction error: {e}")
    self._emit_progress("error", f"Extraction failed: {str(e)}")
    raise Exception(f"Course plan extraction failed: {e}")
```

### **Fix 4: DateTime Import (endpoints.py)**

**Changed:**
```python
# Before
import datetime

# After
from datetime import datetime
```

**Why:** Prevents variable shadowing issues in error handling code

---

## 🧪 Test Again

1. **Restart backend:**
   ```bash
   cd smartdoc_formatter_j
   python -m uvicorn smartdoc_agent.api.main:app --reload
   ```

2. **Try Academic Course Plan:**
   - Upload a syllabus document
   - Select "Academic Course Plan" template
   - Watch the debug output in terminal
   - Should now see what the LLM returns

---

## 🔍 What to Look For

### **In Terminal Output:**

**If working:**
```
[DEBUG] LLM Response length: 1234
[DEBUG] LLM Response (first 500 chars): {"course_name": "...
Extracted basic info and 5 modules
```

**If still failing:**
```
[DEBUG] LLM Response length: 0
[ERROR] JSON parsing failed. LLM response was: ''
```

**Or:**
```
[DEBUG] LLM Response length: 150
[DEBUG] LLM Response (first 500 chars): I apologize, but I cannot...
[ERROR] JSON parsing failed. LLM response was: 'I apologize, but I cannot...'
```

---

## 🤔 If Still Failing

### **Possible Causes:**

1. **LLM refusing to generate JSON**
   - Model might be refusing the request
   - Try with a different document

2. **API rate limiting**
   - Groq might be throttling
   - Wait a minute and retry

3. **Document too complex**
   - Syllabus might be too long
   - Try with a simpler/shorter document

4. **Model hallucination**
   - LLM might be confused by prompt
   - Check the prompt in `template_agent.py` line 220-264

---

## 📋 Quick Test Document

**Create a simple test syllabus (test_syllabus.docx):**

```
Course Name: Introduction to Python Programming
Course Code: CS101
Credits: 3

Course Outcomes:
CO1: Understand basic programming concepts
CO2: Write simple Python programs
CO3: Use data structures effectively
CO4: Debug and test code
CO5: Apply programming to solve problems

Modules:
Module 1: Python Basics (8 hours)
Module 2: Control Structures (10 hours)
Module 3: Functions (8 hours)
Module 4: Data Structures (12 hours)
Module 5: File Handling (8 hours)
```

---

## ✅ Summary

**Fixed:**
- ✅ DateTime import issue
- ✅ Added debug logging
- ✅ Improved JSON extraction
- ✅ Better error messages
- ✅ Empty response handling

**Next Steps:**
1. Restart backend
2. Try with test document
3. Check terminal for debug output
4. Report what you see

---

**The fixes will help us see exactly what the LLM is returning and handle edge cases better!** 🔍
