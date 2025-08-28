// 示例脚本：添加大学requirements数据
// 这个脚本可以用来为现有的大学添加一些示例requirements

const sampleRequirements = [
  {
    requirement_type: 'transcript',
    requirement_name: 'High School Transcript',
    description: 'Official high school transcript with all grades',
    is_required: true,
    order_index: 1
  },
  {
    requirement_type: 'test_scores',
    requirement_name: 'SAT/ACT Scores',
    description: 'Official SAT or ACT test scores',
    is_required: true,
    order_index: 2
  },
  {
    requirement_type: 'essay',
    requirement_name: 'Personal Statement',
    description: 'Personal essay or statement of purpose',
    is_required: true,
    order_index: 3
  },
  {
    requirement_type: 'recommendation',
    requirement_name: 'Letters of Recommendation',
    description: 'Two letters of recommendation from teachers',
    is_required: true,
    order_index: 4
  },
  {
    requirement_type: 'fee',
    requirement_name: 'Application Fee',
    description: 'Non-refundable application processing fee',
    is_required: true,
    order_index: 5
  },
  {
    requirement_type: 'essay',
    requirement_name: 'Supplemental Essays',
    description: 'Additional essays specific to this university',
    is_required: false,
    order_index: 6
  },
  {
    requirement_type: 'activities',
    requirement_name: 'Activities List',
    description: 'List of extracurricular activities and achievements',
    is_required: true,
    order_index: 7
  }
]

// 使用说明：
// 1. 首先获取大学的ID（从数据库或API）
// 2. 然后使用POST请求为每个大学添加requirements
// 3. 示例API调用：
/*
fetch('/api/v1/universities/{university_id}/requirements', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(sampleRequirements[0])
})
*/

console.log('Sample requirements data ready to be added to universities')
console.log('Requirements:', sampleRequirements) 