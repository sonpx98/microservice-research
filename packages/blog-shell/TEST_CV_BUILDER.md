# Test CV Builder - Component Detection

## Test Cases

### Test 1: Experience với tiêu đề khác
Copy đoạn markdown này vào editor:

```markdown
# John Doe
**Senior Developer**
john@example.com | +1-555-0000 | San Francisco, CA

## Work History

### Senior Engineer @ Google
San Francisco, CA | Jan 2020 - Present

- Led team of 5 developers
- Built scalable microservices
- Improved performance by 40%

### Developer @ Facebook
Menlo Park, CA | Jun 2018 - Dec 2019

- Developed React components
- Optimized build pipeline
```

**Expected:** Section "Work History" nên được nhận diện là **Experience component** vì có H3 với pattern `@ Company`, dates, và bullets.

---

### Test 2: Education với tiêu đề khác
Copy đoạn này:

```markdown
## Academic Background

### Bachelor of Science @ Stanford University
Computer Science | Stanford, CA | Sep 2014 - May 2018

GPA: 3.9/4.0
- Dean's List
- Summa Cum Laude
```

**Expected:** "Academic Background" nên được nhận diện là **Education component** vì có university, degree pattern.

---

### Test 3: Skills với format khác
```markdown
## Technical Stack

**Languages:** JavaScript, TypeScript, Python
**Frameworks:** React, Next.js, Node.js
**Tools:** Git, Docker, AWS
```

**Expected:** "Technical Stack" nên được nhận diện là **Skills component** vì có **category:** items pattern.

---

### Test 4: Projects với tiêu đề khác
```markdown
## Portfolio

### E-commerce Platform
Built a full-stack shopping site with Next.js and Stripe integration.

Technologies: React, Next.js, Stripe, PostgreSQL
- Handles 10k+ daily users
- 99.9% uptime
```

**Expected:** "Portfolio" nên được nhận diện là **Projects component** vì có H3, technologies, và bullets.

---

### Test 5: Summary với keyword chính xác
```markdown
## Professional Summary

Passionate full-stack developer with 5+ years of experience building scalable web applications. Expert in React, Node.js, and cloud infrastructure.
```

**Expected:** "Professional Summary" nên được nhận diện là **Summary component** vì title có keyword "summary".

---

### Test 5b: About Me (Raw - không có keyword "summary")
```markdown
## About Me

Passionate full-stack developer with 5+ years of experience building scalable web applications. Expert in React, Node.js, and cloud infrastructure.
```

**Expected:** "About Me" nên hiển thị là **Raw Content card** vì:
- Không có keyword "summary/objective/tóm tắt"
- Không match bất kỳ structure pattern nào
- Chỉ là markdown tự do

---

### Test 6: Raw content thực sự (không match pattern nào)
```markdown
## Hobbies

I love hiking, photography, and playing guitar. On weekends you can find me exploring the mountains or jamming with friends.
```

**Expected:** "Hobbies" nên hiển thị là **Raw Content card** vì không có structure của component nào cả.

---

## Testing Instructions

1. Mở CV Generator: http://localhost:3000/en/tools/cv-generator
2. Paste từng test case vào Markdown editor
3. Kiểm tra preview panel:
   - Component đúng type được tạo
   - Data được parse chính xác
   - Raw content chỉ hiện khi thực sự không match pattern

## Nguyên tắc Detection

```
Nếu title có keyword → Detect bằng keyword matching
  "## Summary" → Summary component
  "## Experience" → Experience component

Nếu title không có keyword → Try detect bằng structure pattern
  "## Technical Stack" → Skills (pattern: **Category:** items)
  "## Work History" → Experience (pattern: H3 @ Company, dates, bullets)
  "## Portfolio" → Projects (pattern: H3, technologies, bullets)
  
Nếu không match keyword và không match pattern → Raw content
  "## About Me" → Raw content (không có structure pattern)
  "## Hobbies" → Raw content (không có structure pattern)
  "## Random Content" → Raw content (markdown tự do)
```

## Fix Summary

**Before:**
- Mọi section không match exact keywords (experience, education, skills...) đều thành raw content
- Dẫn đến mất structure khi copy từ nguồn khác

**After:**
- **2-tier detection:**
  1. **Keyword-based (main loop):** Nếu title có keyword → component chính xác
  2. **Pattern-based (tryDetectComponentType):** Nếu structure match → component tương ứng
  3. **Fallback (raw):** Nếu không match keyword và pattern → Raw content

- **Pattern detection áp dụng cho:**
  - Experience: H3 với `@` hoặc `|`, dates, bullets
  - Education: university/college/degree keywords
  - Skills: category: items pattern (`**Category:** items`)
  - Projects: H3, technologies, links
  - Languages: proficiency keywords
  - Certifications: issuer, credential patterns

- **Raw content dùng cho:**
  - Markdown tự do không match bất kỳ pattern nào
  - Custom sections không có cấu trúc
