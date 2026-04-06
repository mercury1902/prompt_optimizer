# Chatbot Improvement Plan

## Overview
Cải thiện chatbot để hiển thị rõ ràng commands từ Engineer và Marketing kits, tối ưu UX.

## Tasks

### Task 1: Thiết kế Module Command Browser
- Tạo kit filter tabs (All | Engineer | Marketing)
- Thêm search bar trong command browser
- Hiển thị command count theo kit
- Design command cards với complexity indicator

### Task 2: Tìm hiểu Tính năng Bổ sung
- Research UX patterns từ các AI tools (Claude, ChatGPT, VividKit)
- Đề xuất features: Favorites, Recent commands, Command comparison

### Task 3: Implement Command Catalog View
- Tạo CommandDetail modal khi click command
- Hiển thị: description, use cases, variants, args, examples
- Thêm WorkflowBrowser tương tự CommandBrowser

## Execution Order
1. Design module structure (task 6)
2. Research UX patterns (task 7)  
3. Implement command browser (task 8)
4. Test và review

## Success Criteria
- [ ] Kit filter tabs hoạt động
- [ ] Search commands real-time
- [ ] Command detail view hiển thị đầy đủ thông tin
- [ ] Workflow browser hoạt động
- [ ] All tests pass
