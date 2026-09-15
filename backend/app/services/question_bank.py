import json
from typing import List, Dict, Any, Optional
from app.models.assessment import QuestionType, DifficultyLevel

VALIDATED_QUESTION_BANK = [
    # =========================================================================
    # --- PRACTICAL CODING CHALLENGES (QuestionType.CODE) ---
    # =========================================================================

    # 1. Python (Beginner) - Find Duplicates
    {
        "skill_tested": "Python",
        "difficulty": DifficultyLevel.BEGINNER,
        "question_type": QuestionType.CODE,
        "question_text": "Given an integer array `numbers`, return an array of all unique integers that appear more than once in the array, sorted in ascending order. If no duplicate elements exist, return an empty array `[]`.",
        "options": {
            "title": "Find All Duplicates in an Array",
            "description": "Given an array of integers `numbers`, find and return all unique elements that appear more than once in the array.\n\nThe returned array must be sorted in ascending order. If no elements appear more than once, return an empty array `[]`.",
            "language": "python",
            "starter_code": "def find_duplicates(numbers: list[int]) -> list[int]:\n    # Write your solution below\n    pass\n",
            "starter_templates": {
                "python": "def find_duplicates(numbers: list[int]) -> list[int]:\n    # Write your solution below\n    pass\n",
                "javascript": "/**\n * @param {number[]} numbers\n * @return {number[]}\n */\nfunction findDuplicates(numbers) {\n    // Write your solution below\n    return [];\n}\n",
                "typescript": "function findDuplicates(numbers: number[]): number[] {\n    // Write your solution below\n    return [];\n}\n",
                "java": "class Solution {\n    public int[] findDuplicates(int[] numbers) {\n        // Write your solution below\n        return new int[]{};\n    }\n}\n",
                "cpp": "class Solution {\npublic:\n    vector<int> findDuplicates(vector<int>& numbers) {\n        // Write your solution below\n        return {};\n    }\n};\n"
            },
            "examples": [
                {
                    "id": 1,
                    "input": "numbers = [1, 2, 3, 2, 4, 5, 1]",
                    "output": "[1, 2]",
                    "explanation": "Numbers 1 and 2 each appear twice in the array. Return sorted: [1, 2]."
                },
                {
                    "id": 2,
                    "input": "numbers = [10, 20, 30]",
                    "output": "[]",
                    "explanation": "All numbers are distinct, so no duplicates exist."
                },
                {
                    "id": 3,
                    "input": "numbers = [4, 4, 4, 4]",
                    "output": "[4]",
                    "explanation": "4 appears four times. Return only unique duplicates: [4]."
                }
            ],
            "constraints": [
                "0 <= numbers.length <= 10^5",
                "-10^9 <= numbers[i] <= 10^9",
                "Expected Time Complexity: O(N)",
                "Expected Space Complexity: O(N)"
            ],
            "hints": [
                "Can you use a Hash Set to track numbers you have already seen in O(1) time?",
                "Store numbers that appear more than once in a separate duplicate set to avoid recording the same duplicate repeatedly."
            ],
            "test_cases": [
                {"input": "numbers = [1, 2, 3, 2, 4, 5, 1]", "expected": "[1, 2]"},
                {"input": "numbers = [10, 20, 30]", "expected": "[]"},
                {"input": "numbers = [4, 4, 4, 4]", "expected": "[4]"}
            ]
        },
        "correct_answer": {
            "language": "python",
            "entry_point": "find_duplicates",
            "test_cases": [
                {"args": [[1, 2, 3, 2, 4, 5, 1]], "expected": [1, 2], "input_repr": "numbers = [1, 2, 3, 2, 4, 5, 1]"},
                {"args": [[10, 20, 30]], "expected": [], "input_repr": "numbers = [10, 20, 30]"},
                {"args": [[4, 4, 4, 4]], "expected": [4], "input_repr": "numbers = [4, 4, 4, 4]"},
                {"args": [[7, 8, 9, 8, 7, 10]], "expected": [7, 8], "input_repr": "numbers = [7, 8, 9, 8, 7, 10]"}
            ]
        },
        "explanation": "Traverse the array using a seen set and a duplicates set, then return sorted(list(duplicates)). O(N) time complexity."
    },

    # 2. Python (Intermediate) - Two Sum
    {
        "skill_tested": "Python",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "question_type": QuestionType.CODE,
        "question_text": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Return the indices sorted in ascending order `[i, j]`. Each input will have exactly one solution.",
        "options": {
            "title": "Two Sum",
            "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.\n\nYou can return the answer in ascending sorted order `[i, j]`.",
            "language": "python",
            "starter_code": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # Return [i, j] such that nums[i] + nums[j] == target\n    pass\n",
            "starter_templates": {
                "python": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # Return [i, j] such that nums[i] + nums[j] == target\n    pass\n",
                "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Return [i, j] such that nums[i] + nums[j] == target\n    return [];\n}\n",
                "typescript": "function twoSum(nums: number[], target: number): number[] {\n    // Return [i, j] such that nums[i] + nums[j] == target\n    return [];\n}\n",
                "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Return indices [i, j]\n        return new int[]{};\n    }\n}\n",
                "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Return indices [i, j]\n        return {};\n    }\n};\n"
            },
            "examples": [
                {
                    "id": 1,
                    "input": "nums = [2, 7, 11, 15], target = 9",
                    "output": "[0, 1]",
                    "explanation": "Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."
                },
                {
                    "id": 2,
                    "input": "nums = [3, 2, 4], target = 6",
                    "output": "[1, 2]",
                    "explanation": "Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2]."
                },
                {
                    "id": 3,
                    "input": "nums = [3, 3], target = 6",
                    "output": "[0, 1]",
                    "explanation": "Because nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1]."
                }
            ],
            "constraints": [
                "2 <= nums.length <= 10^4",
                "-10^9 <= nums[i] <= 10^9",
                "-10^9 <= target <= 10^9",
                "Only one valid answer exists."
            ],
            "hints": [
                "A brute force approach scans all pairs with O(N^2) time complexity. Can you do it in O(N)?",
                "Try using a hash map to store the complement `target - num` along with its index as you iterate through the list."
            ],
            "test_cases": [
                {"input": "nums = [2, 7, 11, 15], target = 9", "expected": "[0, 1]"},
                {"input": "nums = [3, 2, 4], target = 6", "expected": "[1, 2]"},
                {"input": "nums = [3, 3], target = 6", "expected": "[0, 1]"}
            ]
        },
        "correct_answer": {
            "language": "python",
            "entry_point": "two_sum",
            "test_cases": [
                {"args": [[2, 7, 11, 15], 9], "expected": [0, 1], "input_repr": "nums = [2, 7, 11, 15], target = 9"},
                {"args": [[3, 2, 4], 6], "expected": [1, 2], "input_repr": "nums = [3, 2, 4], target = 6"},
                {"args": [[3, 3], 6], "expected": [0, 1], "input_repr": "nums = [3, 3], target = 6"},
                {"args": [[1, 5, 7, 12, 19], 20], "expected": [0, 4], "input_repr": "nums = [1, 5, 7, 12, 19], target = 20"}
            ]
        },
        "explanation": "Use a hash map mapping each value to its index. For each number, check if target - num exists in the hash map in O(1) time."
    },

    # 3. Python (Advanced) - Merge Intervals
    {
        "skill_tested": "Python",
        "difficulty": DifficultyLevel.ADVANCED,
        "question_type": QuestionType.CODE,
        "question_text": "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input, sorted by start time.",
        "options": {
            "title": "Merge Overlapping Intervals",
            "description": "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input in sorted order.\n\nIntervals `[a, b]` and `[c, d]` overlap if `c <= b` (assuming `a <= c`).",
            "language": "python",
            "starter_code": "def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:\n    # Merge overlapping intervals and return sorted result\n    pass\n",
            "starter_templates": {
                "python": "def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:\n    # Merge overlapping intervals and return sorted result\n    pass\n",
                "javascript": "/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction mergeIntervals(intervals) {\n    // Merge overlapping intervals\n    return [];\n}\n",
                "typescript": "function mergeIntervals(intervals: number[][]): number[][] {\n    // Merge overlapping intervals\n    return [];\n}\n",
                "java": "class Solution {\n    public int[][] mergeIntervals(int[][] intervals) {\n        // Merge overlapping intervals\n        return new int[][]{};\n    }\n}\n",
                "cpp": "class Solution {\npublic:\n    vector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {\n        // Merge overlapping intervals\n        return {};\n    }\n};\n"
            },
            "examples": [
                {
                    "id": 1,
                    "input": "intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]",
                    "output": "[[1, 6], [8, 10], [15, 18]]",
                    "explanation": "Since intervals [1, 3] and [2, 6] overlap, merge them into [1, 6]."
                },
                {
                    "id": 2,
                    "input": "intervals = [[1, 4], [4, 5]]",
                    "output": "[[1, 5]]",
                    "explanation": "Intervals [1, 4] and [4, 5] touch at 4 and are considered overlapping."
                }
            ],
            "constraints": [
                "1 <= intervals.length <= 10^4",
                "intervals[i].length == 2",
                "0 <= start_i <= end_i <= 10^4",
                "Output must be sorted by start time."
            ],
            "hints": [
                "Sorting intervals by start time first allows you to compare each interval with only the previous interval in the result.",
                "If `current.start <= previous.end`, update `previous.end = max(previous.end, current.end)`."
            ],
            "test_cases": [
                {"input": "intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]", "expected": "[[1, 6], [8, 10], [15, 18]]"},
                {"input": "intervals = [[1, 4], [4, 5]]", "expected": "[[1, 5]]"}
            ]
        },
        "correct_answer": {
            "language": "python",
            "entry_point": "merge_intervals",
            "test_cases": [
                {"args": [[[1, 3], [2, 6], [8, 10], [15, 18]]], "expected": [[1, 6], [8, 10], [15, 18]], "input_repr": "[[1, 3], [2, 6], [8, 10], [15, 18]]"},
                {"args": [[[1, 4], [4, 5]]], "expected": [[1, 5]], "input_repr": "[[1, 4], [4, 5]]"},
                {"args": [[[6, 8], [1, 9], [2, 4]]], "expected": [[1, 9]], "input_repr": "[[6, 8], [1, 9], [2, 4]]"},
                {"args": [[[1, 4], [2, 3]]], "expected": [[1, 4]], "input_repr": "[[1, 4], [2, 3]]"}
            ]
        },
        "explanation": "Sort intervals by start time. Iterate through and either merge with the previous interval if start <= last_end, or append new interval."
    },

    # 4. Machine Learning (Beginner) - Classification Accuracy
    {
        "skill_tested": "Machine Learning",
        "difficulty": DifficultyLevel.BEGINNER,
        "question_type": QuestionType.CODE,
        "question_text": "Write a function `calculate_accuracy(y_true: list[int], y_pred: list[int]) -> float` that computes classification accuracy: (Correct Predictions) / (Total Predictions). Return a float rounded to 2 decimal places. Return 0.0 if inputs are empty.",
        "options": {
            "title": "Classification Accuracy Metric",
            "description": "Compute the classification accuracy score between ground truth labels `y_true` and predicted model labels `y_pred`.\n\nAccuracy is formulated as:\n`Accuracy = (Number of Correct Predictions) / (Total Number of Predictions)`\n\nReturn the accuracy as a float rounded to 2 decimal places (e.g. `0.75`). If both lists are empty, return `0.0`.",
            "language": "python",
            "starter_code": "def calculate_accuracy(y_true: list[int], y_pred: list[int]) -> float:\n    # Return classification accuracy rounded to 2 decimal places\n    pass\n",
            "starter_templates": {
                "python": "def calculate_accuracy(y_true: list[int], y_pred: list[int]) -> float:\n    # Return classification accuracy rounded to 2 decimal places\n    pass\n",
                "javascript": "/**\n * @param {number[]} y_true\n * @param {number[]} y_pred\n * @return {number}\n */\nfunction calculateAccuracy(y_true, y_pred) {\n    // Return accuracy rounded to 2 decimal places\n    return 0.0;\n}\n",
                "typescript": "function calculateAccuracy(y_true: number[], y_pred: number[]): number {\n    // Return accuracy rounded to 2 decimal places\n    return 0.0;\n}\n",
                "java": "class Solution {\n    public double calculateAccuracy(int[] y_true, int[] y_pred) {\n        // Return accuracy rounded to 2 decimal places\n        return 0.0;\n    }\n}\n",
                "cpp": "class Solution {\npublic:\n    double calculateAccuracy(vector<int>& y_true, vector<int>& y_pred) {\n        // Return accuracy rounded to 2 decimal places\n        return 0.0;\n    }\n};\n"
            },
            "examples": [
                {
                    "id": 1,
                    "input": "y_true = [1, 0, 1, 1], y_pred = [1, 0, 0, 1]",
                    "output": "0.75",
                    "explanation": "3 out of 4 predictions match true labels (3 / 4 = 0.75)."
                },
                {
                    "id": 2,
                    "input": "y_true = [1, 1, 1], y_pred = [1, 1, 1]",
                    "output": "1.0",
                    "explanation": "All predictions match ground truth labels (3 / 3 = 1.0)."
                },
                {
                    "id": 3,
                    "input": "y_true = [0, 1], y_pred = [1, 0]",
                    "output": "0.0",
                    "explanation": "None of the predictions match true labels."
                }
            ],
            "constraints": [
                "len(y_true) == len(y_pred)",
                "0 <= len(y_true) <= 10^5",
                "Elements are binary (0, 1) or multiclass categorical integers.",
                "Return float rounded to 2 decimal places."
            ],
            "hints": [
                "Check for empty input lists first to prevent division by zero.",
                "Count matching indices `sum(1 for t, p in zip(y_true, y_pred) if t == p)` and divide by `len(y_true)`."
            ],
            "test_cases": [
                {"input": "y_true = [1, 0, 1, 1], y_pred = [1, 0, 0, 1]", "expected": "0.75"},
                {"input": "y_true = [1, 1, 1], y_pred = [1, 1, 1]", "expected": "1.0"},
                {"input": "y_true = [0, 1], y_pred = [1, 0]", "expected": "0.0"}
            ]
        },
        "correct_answer": {
            "language": "python",
            "entry_point": "calculate_accuracy",
            "test_cases": [
                {"args": [[1, 0, 1, 1], [1, 0, 0, 1]], "expected": 0.75, "input_repr": "y_true = [1, 0, 1, 1], y_pred = [1, 0, 0, 1]"},
                {"args": [[1, 1, 1], [1, 1, 1]], "expected": 1.0, "input_repr": "y_true = [1, 1, 1], y_pred = [1, 1, 1]"},
                {"args": [[0, 1], [1, 0]], "expected": 0.0, "input_repr": "y_true = [0, 1], y_pred = [1, 0]"},
                {"args": [[], []], "expected": 0.0, "input_repr": "empty lists"}
            ]
        },
        "explanation": "Sum matching elements sum(1 for t, p in zip(y_true, y_pred) if t == p) / len(y_true) and round to 2 decimals."
    },

    # 5. Machine Learning (Intermediate) - Min-Max Normalization
    {
        "skill_tested": "Machine Learning",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "question_type": QuestionType.CODE,
        "question_text": "Write a function `min_max_scale(values: list[float]) -> list[float]` that performs Min-Max feature scaling: `(x - min) / (max - min)`. Each value must be rounded to 2 decimal places. If all values are identical or the list is empty, return a list of zeros with the same length.",
        "options": {
            "title": "Min-Max Feature Scaling",
            "description": "Implement Min-Max normalization for a feature vector `values`.\n\nFor every element `x`, calculate:\n`scaled_x = (x - min) / (max - min)`\n\nEach scaled value must be rounded to 2 decimal places. If all values in the list are identical (i.e. `max == min`) or the list is empty, return a list of `0.0` with the same length.",
            "language": "python",
            "starter_code": "def min_max_scale(values: list[float]) -> list[float]:\n    # Scale numbers between 0.0 and 1.0 rounded to 2 decimal places\n    pass\n",
            "starter_templates": {
                "python": "def min_max_scale(values: list[float]) -> list[float]:\n    # Scale numbers between 0.0 and 1.0 rounded to 2 decimal places\n    pass\n",
                "javascript": "/**\n * @param {number[]} values\n * @return {number[]}\n */\nfunction minMaxScale(values) {\n    // Scale numbers between 0.0 and 1.0 rounded to 2 decimal places\n    return [];\n}\n",
                "typescript": "function minMaxScale(values: number[]): number[] {\n    // Scale numbers between 0.0 and 1.0 rounded to 2 decimal places\n    return [];\n}\n",
                "java": "class Solution {\n    public double[] minMaxScale(double[] values) {\n        // Scale numbers between 0.0 and 1.0 rounded to 2 decimal places\n        return new double[]{};\n    }\n}\n",
                "cpp": "class Solution {\npublic:\n    vector<double> minMaxScale(vector<double>& values) {\n        // Scale numbers between 0.0 and 1.0 rounded to 2 decimal places\n        return {};\n    }\n};\n"
            },
            "examples": [
                {
                    "id": 1,
                    "input": "values = [10.0, 20.0, 30.0, 40.0, 50.0]",
                    "output": "[0.0, 0.25, 0.5, 0.75, 1.0]",
                    "explanation": "min is 10.0 and max is 50.0. Scale range is 40.0."
                },
                {
                    "id": 2,
                    "input": "values = [5.0, 5.0, 5.0]",
                    "output": "[0.0, 0.0, 0.0]",
                    "explanation": "min == max, so all outputs are 0.0."
                },
                {
                    "id": 3,
                    "input": "values = [0.0, 100.0]",
                    "output": "[0.0, 1.0]",
                    "explanation": "min is 0.0 and max is 100.0."
                }
            ],
            "constraints": [
                "0 <= values.length <= 10^5",
                "-10^9 <= values[i] <= 10^9",
                "Round every element to 2 decimal places."
            ],
            "hints": [
                "Find min and max in a single traversal.",
                "If `max == min`, guard against zero division by returning `[0.0] * len(values)`."
            ],
            "test_cases": [
                {"input": "values = [10.0, 20.0, 30.0, 40.0, 50.0]", "expected": "[0.0, 0.25, 0.5, 0.75, 1.0]"},
                {"input": "values = [5.0, 5.0, 5.0]", "expected": "[0.0, 0.0, 0.0]"},
                {"input": "values = [0.0, 100.0]", "expected": "[0.0, 1.0]"}
            ]
        },
        "correct_answer": {
            "language": "python",
            "entry_point": "min_max_scale",
            "test_cases": [
                {"args": [[10.0, 20.0, 30.0, 40.0, 50.0]], "expected": [0.0, 0.25, 0.5, 0.75, 1.0], "input_repr": "values = [10.0, 20.0, 30.0, 40.0, 50.0]"},
                {"args": [[5.0, 5.0, 5.0]], "expected": [0.0, 0.0, 0.0], "input_repr": "values = [5.0, 5.0, 5.0]"},
                {"args": [[0.0, 100.0]], "expected": [0.0, 1.0], "input_repr": "values = [0.0, 100.0]"}
            ]
        },
        "explanation": "Compute min and max. If max == min, return [0.0]*N. Otherwise apply (x - min) / (max - min) rounded to 2 decimals."
    },

    # 6. React / Frontend (Intermediate) - Group By Key
    {
        "skill_tested": "React",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "question_type": QuestionType.CODE,
        "question_text": "Write a function `group_by_key(items: list[dict], key: str) -> dict` that takes a list of dictionaries and groups them by the value of the specified key. The output should map each unique key value to a list of matching dictionaries in their original order.",
        "options": {
            "title": "Group Array of Objects By Key",
            "description": "Write a function that takes an array of dictionaries/objects `items` and a string `key`. Group the items by the value of the specified `key`.\n\nThe output should map each unique key value to an array of matching dictionaries in their original order.",
            "language": "python",
            "starter_code": "def group_by_key(items: list[dict], key: str) -> dict:\n    # Group list of dictionaries by key value\n    pass\n",
            "starter_templates": {
                "python": "def group_by_key(items: list[dict], key: str) -> dict:\n    # Group list of dictionaries by key value\n    pass\n",
                "javascript": "/**\n * @param {Array<Object>} items\n * @param {string} key\n * @return {Object}\n */\nfunction groupByKey(items, key) {\n    // Group items by key value\n    return {};\n}\n",
                "typescript": "function groupByKey(items: Array<Record<string, any>>, key: string): Record<string, any[]> {\n    // Group items by key value\n    return {};\n}\n",
                "java": "class Solution {\n    public Map<String, List<Map<String, Object>>> groupByKey(List<Map<String, Object>> items, String key) {\n        // Group items by key value\n        return new HashMap<>();\n    }\n}\n",
                "cpp": "class Solution {\npublic:\n    // Group items by key value\n};\n"
            },
            "examples": [
                {
                    "id": 1,
                    "input": "items = [{'id': 1, 'role': 'dev'}, {'id': 2, 'role': 'design'}, {'id': 3, 'role': 'dev'}], key = 'role'",
                    "output": "{'dev': [{'id': 1, 'role': 'dev'}, {'id': 3, 'role': 'dev'}], 'design': [{'id': 2, 'role': 'design'}]}",
                    "explanation": "Items with role 'dev' are collected under 'dev', and role 'design' under 'design'."
                }
            ],
            "constraints": [
                "1 <= items.length <= 10^4",
                "`key` is guaranteed to exist in each dictionary."
            ],
            "hints": [
                "Use a defaultdict(list) in Python or `items.reduce()` in JavaScript to accumulate matching items."
            ],
            "test_cases": [
                {"input": "items=[{'id': 1, 'role': 'dev'}, {'id': 2, 'role': 'design'}, {'id': 3, 'role': 'dev'}], key='role'", "expected": "{'dev': [{'id': 1, 'role': 'dev'}, {'id': 3, 'role': 'dev'}], 'design': [{'id': 2, 'role': 'design'}]}"}
            ]
        },
        "correct_answer": {
            "language": "python",
            "entry_point": "group_by_key",
            "test_cases": [
                {
                    "args": [[{"id": 1, "role": "dev"}, {"id": 2, "role": "design"}, {"id": 3, "role": "dev"}], "role"],
                    "expected": {"dev": [{"id": 1, "role": "dev"}, {"id": 3, "role": "dev"}], "design": [{"id": 2, "role": "design"}]},
                    "input_repr": "items=[{'id': 1, 'role': 'dev'}, ...], key='role'"
                },
                {
                    "args": [[{"name": "A", "team": "Alpha"}, {"name": "B", "team": "Beta"}], "team"],
                    "expected": {"Alpha": [{"name": "A", "team": "Alpha"}], "Beta": [{"name": "B", "team": "Beta"}]},
                    "input_repr": "team grouping"
                }
            ]
        },
        "explanation": "Iterate through items, extracting item[key], appending to result dictionary defaultdict(list)."
    },

    # 7. SQL (Intermediate) - Department Max Salary Query
    {
        "skill_tested": "SQL",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "question_type": QuestionType.CODE,
        "question_text": "Write a SQL query that retrieves the department name and maximum salary for each department from the `employees` table. Schema: `employees (id INT, name TEXT, department TEXT, salary INT)`. Return columns `department` and `max_salary`.",
        "options": {
            "title": "Department Highest Salary",
            "description": "Write a SQL query that retrieves the department name and maximum salary for each department from the `employees` table.\n\n**Schema Definition:**\n`employees (id INT, name TEXT, department TEXT, salary INT)`\n\nThe result table should contain columns `department` and `max_salary`.",
            "language": "sql",
            "starter_code": "-- Write your SQL query below\nSELECT department, MAX(salary) AS max_salary\nFROM employees\nGROUP BY department;\n",
            "starter_templates": {
                "sql": "-- Write your SQL query below\nSELECT department, MAX(salary) AS max_salary\nFROM employees\nGROUP BY department;\n"
            },
            "examples": [
                {
                    "id": 1,
                    "input": "employees = [(1, 'Alice', 'Engineering', 110000), (2, 'Bob', 'Engineering', 120000), (3, 'Carol', 'Marketing', 85000), (4, 'David', 'Sales', 95000), (5, 'Eve', 'Sales', 90000)]",
                    "output": "[['Engineering', 120000], ['Marketing', 85000], ['Sales', 95000]]",
                    "explanation": "Engineering max is 120,000, Marketing max is 85,000, Sales max is 95,000."
                }
            ],
            "constraints": [
                "Return exactly two columns: `department` and `max_salary`.",
                "Only standard SELECT statements permitted."
            ],
            "hints": [
                "Use `GROUP BY department` combined with aggregate function `MAX(salary)`."
            ],
            "test_cases": [
                {"input": "Table: employees(id, name, department, salary)", "expected": "[['Engineering', 120000], ['Marketing', 85000], ['Sales', 95000]]"}
            ]
        },
        "correct_answer": {
            "language": "sql",
            "setup_sql": "CREATE TABLE employees (id INT, name TEXT, department TEXT, salary INT); INSERT INTO employees VALUES (1, 'Alice', 'Engineering', 110000), (2, 'Bob', 'Engineering', 120000), (3, 'Carol', 'Marketing', 85000), (4, 'David', 'Sales', 95000), (5, 'Eve', 'Sales', 90000);",
            "expected_rows": [["Engineering", 120000], ["Marketing", 85000], ["Sales", 95000]],
            "order_sensitive": False
        },
        "explanation": "GROUP BY department combined with aggregate function MAX(salary)."
    },

        {   'correct_answer': {   'entry_point': 'contains_duplicate',
                          'language': 'python',
                          'test_cases': [   {   'args': [[1, 2, 3, 1]],
                                                'expected': True,
                                                'input_repr': 'nums = [1, 2, 3, 1]'},
                                            {   'args': [[1, 2, 3, 4]],
                                                'expected': False,
                                                'input_repr': 'nums = [1, 2, 3, 4]'},
                                            {   'args': [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]],
                                                'expected': True,
                                                'input_repr': 'nums = [1, 1, 1, 3, ... ]'},
                                            {'args': [[7]], 'expected': False, 'input_repr': 'nums = [7]'}]},
    'difficulty': DifficultyLevel.BEGINNER,
    'explanation': 'Use a hash set or compare len(nums) == len(set(nums)). O(N) time and O(N) space.',
    'options': {   'constraints': [   '1 <= nums.length <= 10^5',
                                      '-10^9 <= nums[i] <= 10^9',
                                      'Expected Time Complexity: O(N)',
                                      'Expected Space Complexity: O(N)'],
                   'description': 'Given an integer array `nums`, return `true` if any value appears at least twice in '
                                  'the array, and return `false` if every element is distinct.',
                   'examples': [   {   'explanation': '1 appears at index 0 and index 3.',
                                       'id': 1,
                                       'input': 'nums = [1, 2, 3, 1]',
                                       'output': 'true'},
                                   {   'explanation': 'All elements are distinct.',
                                       'id': 2,
                                       'input': 'nums = [1, 2, 3, 4]',
                                       'output': 'false'},
                                   {   'explanation': 'Multiple duplicates exist.',
                                       'id': 3,
                                       'input': 'nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]',
                                       'output': 'true'}],
                   'hints': [   'A hash set allows you to check for seen elements in O(1) time.',
                                'Compare len(nums) with len(set(nums)).'],
                   'language': 'python',
                   'starter_code': 'def contains_duplicate(nums: list[int]) -> bool:\n'
                                   '    # Return True if any value appears at least twice\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    bool containsDuplicate(vector<int>& nums) {\n'
                                                   '        return false;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public boolean containsDuplicate(int[] nums) {\n'
                                                    '        // Return true if duplicate exists\n'
                                                    '        return false;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {number[]} nums\n'
                                                          ' * @return {boolean}\n'
                                                          ' */\n'
                                                          'function containsDuplicate(nums) {\n'
                                                          '    // Return true if duplicate exists\n'
                                                          '    return false;\n'
                                                          '}\n',
                                            'python': 'def contains_duplicate(nums: list[int]) -> bool:\n'
                                                      '    # Return True if any value appears at least twice\n'
                                                      '    pass\n',
                                            'typescript': 'function containsDuplicate(nums: number[]): boolean {\n'
                                                          '    // Return true if duplicate exists\n'
                                                          '    return false;\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': 'true', 'input': 'nums = [1, 2, 3, 1]'},
                                     {'expected': 'false', 'input': 'nums = [1, 2, 3, 4]'},
                                     {'expected': 'true', 'input': 'nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]'}],
                   'title': 'Contains Duplicate'},
    'question_text': 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, '
                     'and return `false` if every element is distinct.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'is_palindrome',
                          'language': 'python',
                          'test_cases': [   {   'args': ['A man, a plan, a canal: Panama'],
                                                'expected': True,
                                                'input_repr': "s = 'A man, a plan, a canal: Panama'"},
                                            {   'args': ['race a car'],
                                                'expected': False,
                                                'input_repr': "s = 'race a car'"},
                                            {'args': [' '], 'expected': True, 'input_repr': "s = ' '"},
                                            {'args': ['0P'], 'expected': False, 'input_repr': "s = '0P'"}]},
    'difficulty': DifficultyLevel.BEGINNER,
    'explanation': 'Filter non-alphanumeric characters, lowercase, and compare with reverse. O(N) time complexity.',
    'options': {   'constraints': [   '1 <= s.length <= 2 * 10^5',
                                      '`s` consists only of printable ASCII characters.',
                                      'Expected Time Complexity: O(N)',
                                      'Expected Space Complexity: O(1) or O(N)'],
                   'description': 'A phrase is a **palindrome** if, after converting all uppercase letters into '
                                  'lowercase letters and removing all non-alphanumeric characters, it reads the same '
                                  'forward and backward.\n'
                                  '\n'
                                  'Alphanumeric characters include letters and numbers.\n'
                                  '\n'
                                  'Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
                   'examples': [   {   'explanation': '"amanaplanacanalpanama" is a palindrome.',
                                       'id': 1,
                                       'input': 's = "A man, a plan, a canal: Panama"',
                                       'output': 'true'},
                                   {   'explanation': '"raceacar" is not a palindrome.',
                                       'id': 2,
                                       'input': 's = "race a car"',
                                       'output': 'false'},
                                   {   'explanation': 'An empty string reads the same forward and backward.',
                                       'id': 3,
                                       'input': 's = " "',
                                       'output': 'true'}],
                   'hints': [   'Filter characters using `c.isalnum()` and convert to lowercase with `c.lower()`.',
                                'Check if the cleaned string equals its reverse `cleaned == cleaned[::-1]`.'],
                   'language': 'python',
                   'starter_code': 'def is_palindrome(s: str) -> bool:\n'
                                   '    # Return True if s is a valid palindrome\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    bool isPalindrome(string s) {\n'
                                                   '        return false;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public boolean isPalindrome(String s) {\n'
                                                    '        // Return true if s is a palindrome\n'
                                                    '        return false;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {string} s\n'
                                                          ' * @return {boolean}\n'
                                                          ' */\n'
                                                          'function isPalindrome(s) {\n'
                                                          '    // Return true if s is a palindrome\n'
                                                          '    return false;\n'
                                                          '}\n',
                                            'python': 'def is_palindrome(s: str) -> bool:\n'
                                                      '    # Return True if s is a valid palindrome\n'
                                                      '    pass\n',
                                            'typescript': 'function isPalindrome(s: string): boolean {\n'
                                                          '    // Return true if s is a palindrome\n'
                                                          '    return false;\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': 'true', 'input': 's = "A man, a plan, a canal: Panama"'},
                                     {'expected': 'false', 'input': 's = "race a car"'},
                                     {'expected': 'true', 'input': 's = " "'}],
                   'title': 'Valid Palindrome'},
    'question_text': 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and '
                     'removing all non-alphanumeric characters, it reads the same forward and backward. Given a string '
                     '`s`, return `true` if it is a palindrome, or `false` otherwise.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'is_anagram',
                          'language': 'python',
                          'test_cases': [   {   'args': ['anagram', 'nagaram'],
                                                'expected': True,
                                                'input_repr': "s = 'anagram', t = 'nagaram'"},
                                            {   'args': ['rat', 'car'],
                                                'expected': False,
                                                'input_repr': "s = 'rat', t = 'car'"},
                                            {'args': ['a', 'a'], 'expected': True, 'input_repr': "s = 'a', t = 'a'"},
                                            {   'args': ['ab', 'a'],
                                                'expected': False,
                                                'input_repr': "s = 'ab', t = 'a'"}]},
    'difficulty': DifficultyLevel.BEGINNER,
    'explanation': 'Count characters using Counter(s) == Counter(t) or sort both strings. O(N) time complexity.',
    'options': {   'constraints': [   '1 <= s.length, t.length <= 5 * 10^4',
                                      '`s` and `t` consist of lowercase English letters.',
                                      'Expected Time Complexity: O(N)'],
                   'description': 'Given two strings `s` and `t`, return `true` if `t` is an **anagram** of `s`, and '
                                  '`false` otherwise.\n'
                                  '\n'
                                  'An **Anagram** is a word or phrase formed by rearranging the letters of a different '
                                  'word or phrase, typically using all the original letters exactly once.',
                   'examples': [   {   'explanation': 'Both strings contain the exact same characters with identical '
                                                      'counts.',
                                       'id': 1,
                                       'input': 's = "anagram", t = "nagaram"',
                                       'output': 'true'},
                                   {   'explanation': "'r' matches, but 't' does not match 'c'.",
                                       'id': 2,
                                       'input': 's = "rat", t = "car"',
                                       'output': 'false'}],
                   'hints': [   'If lengths differ, they cannot be anagrams.',
                                'Count character frequencies using collections.Counter or an array of size 26.'],
                   'language': 'python',
                   'starter_code': 'def is_anagram(s: str, t: str) -> bool:\n'
                                   '    # Return True if t is an anagram of s\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    bool isAnagram(string s, string t) {\n'
                                                   '        return false;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public boolean isAnagram(String s, String t) {\n'
                                                    '        // Return true if t is an anagram of s\n'
                                                    '        return false;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {string} s\n'
                                                          ' * @param {string} t\n'
                                                          ' * @return {boolean}\n'
                                                          ' */\n'
                                                          'function isAnagram(s, t) {\n'
                                                          '    // Return true if t is an anagram of s\n'
                                                          '    return false;\n'
                                                          '}\n',
                                            'python': 'def is_anagram(s: str, t: str) -> bool:\n'
                                                      '    # Return True if t is an anagram of s\n'
                                                      '    pass\n',
                                            'typescript': 'function isAnagram(s: string, t: string): boolean {\n'
                                                          '    // Return true if t is an anagram of s\n'
                                                          '    return false;\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': 'true', 'input': 's = "anagram", t = "nagaram"'},
                                     {'expected': 'false', 'input': 's = "rat", t = "car"'}],
                   'title': 'Valid Anagram'},
    'question_text': 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. '
                     'An anagram is formed by rearranging the letters of a word.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'max_profit',
                          'language': 'python',
                          'test_cases': [   {   'args': [[7, 1, 5, 3, 6, 4]],
                                                'expected': 5,
                                                'input_repr': 'prices = [7, 1, 5, 3, 6, 4]'},
                                            {   'args': [[7, 6, 4, 3, 1]],
                                                'expected': 0,
                                                'input_repr': 'prices = [7, 6, 4, 3, 1]'},
                                            {'args': [[1, 2]], 'expected': 1, 'input_repr': 'prices = [1, 2]'},
                                            {'args': [[2, 4, 1]], 'expected': 2, 'input_repr': 'prices = [2, 4, 1]'}]},
    'difficulty': DifficultyLevel.INTERMEDIATE,
    'explanation': 'Maintain min_price and update max_profit at each index in a single pass. O(N) time and O(1) space.',
    'options': {   'constraints': [   '1 <= prices.length <= 10^5',
                                      '0 <= prices[i] <= 10^4',
                                      'Expected Time Complexity: O(N)',
                                      'Expected Space Complexity: O(1)'],
                   'description': 'You are given an array `prices` where `prices[i]` is the price of a given stock on '
                                  'the `i-th` day.\n'
                                  '\n'
                                  'You want to maximize your profit by choosing a **single day** to buy one stock and '
                                  'choosing a **different day in the future** to sell that stock.\n'
                                  '\n'
                                  'Return *the maximum profit you can achieve from this transaction*. If you cannot '
                                  'achieve any profit, return `0`.',
                   'examples': [   {   'explanation': 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit '
                                                      '= 6 - 1 = 5.',
                                       'id': 1,
                                       'input': 'prices = [7, 1, 5, 3, 6, 4]',
                                       'output': '5'},
                                   {   'explanation': 'In this case, no transactions are done and max profit = 0.',
                                       'id': 2,
                                       'input': 'prices = [7, 6, 4, 3, 1]',
                                       'output': '0'}],
                   'hints': [   'Keep track of the minimum price seen so far as you iterate through the array.',
                                'At each step, calculate potential profit: price - min_price, and update max_profit.'],
                   'language': 'python',
                   'starter_code': 'def max_profit(prices: list[int]) -> int:\n    # Return maximum profit\n    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    int maxProfit(vector<int>& prices) {\n'
                                                   '        return 0;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public int maxProfit(int[] prices) {\n'
                                                    '        // Return maximum profit\n'
                                                    '        return 0;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {number[]} prices\n'
                                                          ' * @return {number}\n'
                                                          ' */\n'
                                                          'function maxProfit(prices) {\n'
                                                          '    // Return maximum profit\n'
                                                          '    return 0;\n'
                                                          '}\n',
                                            'python': 'def max_profit(prices: list[int]) -> int:\n'
                                                      '    # Return maximum profit\n'
                                                      '    pass\n',
                                            'typescript': 'function maxProfit(prices: number[]): number {\n'
                                                          '    // Return maximum profit\n'
                                                          '    return 0;\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': '5', 'input': 'prices = [7, 1, 5, 3, 6, 4]'},
                                     {'expected': '0', 'input': 'prices = [7, 6, 4, 3, 1]'}],
                   'title': 'Best Time to Buy and Sell Stock'},
    'question_text': 'You are given an array `prices` where `prices[i]` is the price of a given stock on day `i`. You '
                     'want to maximize your profit by choosing a single day to buy one stock and choosing a different '
                     'day in the future to sell that stock. Return the maximum profit. If no profit can be achieved, '
                     'return `0`.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'is_valid_parentheses',
                          'language': 'python',
                          'test_cases': [   {'args': ['()'], 'expected': True, 'input_repr': "s = '()'"},
                                            {'args': ['()[]{}'], 'expected': True, 'input_repr': "s = '()[]{}'"},
                                            {'args': ['(]'], 'expected': False, 'input_repr': "s = '(]'"},
                                            {'args': ['{[]}'], 'expected': True, 'input_repr': "s = '{[]}'"},
                                            {'args': ['['], 'expected': False, 'input_repr': "s = '['"}]},
    'difficulty': DifficultyLevel.INTERMEDIATE,
    'explanation': 'Use a stack. Push opening brackets, pop and verify matching type for closing brackets. O(N) time.',
    'options': {   'constraints': [   '1 <= s.length <= 10^4',
                                      "`s` consists of parentheses only `'()[]{}'`.",
                                      'Expected Time Complexity: O(N)',
                                      'Expected Space Complexity: O(N)'],
                   'description': "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` "
                                  "and `']'`, determine if the input string is valid.\n"
                                  '\n'
                                  'An input string is valid if:\n'
                                  '1. Open brackets must be closed by the same type of brackets.\n'
                                  '2. Open brackets must be closed in the correct order.\n'
                                  '3. Every close bracket has a corresponding open bracket of the same type.',
                   'examples': [   {'id': 1, 'input': 's = "()"', 'output': 'true'},
                                   {'id': 2, 'input': 's = "()[]{}"', 'output': 'true'},
                                   {'id': 3, 'input': 's = "(]"', 'output': 'false'},
                                   {'id': 4, 'input': 's = "([])"', 'output': 'true'}],
                   'hints': [   'Use a Stack data structure.',
                                'Push opening brackets onto the stack. When encountering a closing bracket, check if '
                                'it matches the top of the stack.'],
                   'language': 'python',
                   'starter_code': 'def is_valid_parentheses(s: str) -> bool:\n'
                                   '    # Return True if brackets are valid\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    bool isValidParentheses(string s) {\n'
                                                   '        return false;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public boolean isValidParentheses(String s) {\n'
                                                    '        // Return true if brackets are valid\n'
                                                    '        return false;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {string} s\n'
                                                          ' * @return {boolean}\n'
                                                          ' */\n'
                                                          'function isValidParentheses(s) {\n'
                                                          '    // Return true if brackets are valid\n'
                                                          '    return false;\n'
                                                          '}\n',
                                            'python': 'def is_valid_parentheses(s: str) -> bool:\n'
                                                      '    # Return True if brackets are valid\n'
                                                      '    pass\n',
                                            'typescript': 'function isValidParentheses(s: string): boolean {\n'
                                                          '    // Return true if brackets are valid\n'
                                                          '    return false;\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': 'true', 'input': 's = "()"'},
                                     {'expected': 'true', 'input': 's = "()[]{}"'},
                                     {'expected': 'false', 'input': 's = "(]"'},
                                     {'expected': 'true', 'input': 's = "([])"'}],
                   'title': 'Valid Parentheses'},
    'question_text': "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, "
                     'determine if the input string is valid. Open brackets must be closed by the same type of '
                     'brackets in the correct order.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'max_sub_array',
                          'language': 'python',
                          'test_cases': [   {   'args': [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
                                                'expected': 6,
                                                'input_repr': 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]'},
                                            {'args': [[1]], 'expected': 1, 'input_repr': 'nums = [1]'},
                                            {   'args': [[5, 4, -1, 7, 8]],
                                                'expected': 23,
                                                'input_repr': 'nums = [5, 4, -1, 7, 8]'},
                                            {   'args': [[-1, -2, -3]],
                                                'expected': -1,
                                                'input_repr': 'nums = [-1, -2, -3]'}]},
    'difficulty': DifficultyLevel.INTERMEDIATE,
    'explanation': "Kadane's algorithm maintains current_sum = max(n, current_sum + n) and max_sum in a single pass. "
                   'O(N) time.',
    'options': {   'constraints': [   '1 <= nums.length <= 10^5',
                                      '-10^4 <= nums[i] <= 10^4',
                                      'Expected Time Complexity: O(N)',
                                      'Expected Space Complexity: O(1)'],
                   'description': 'Given an integer array `nums`, find the subarray with the largest sum, and return '
                                  '*its sum*.\n'
                                  '\n'
                                  'A **subarray** is a contiguous non-empty sequence of elements within an array.',
                   'examples': [   {   'explanation': 'The subarray [4, -1, 2, 1] has the largest sum 6.',
                                       'id': 1,
                                       'input': 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
                                       'output': '6'},
                                   {   'explanation': 'The subarray [1] has the largest sum 1.',
                                       'id': 2,
                                       'input': 'nums = [1]',
                                       'output': '1'},
                                   {   'explanation': 'The subarray [5, 4, -1, 7, 8] has the largest sum 23.',
                                       'id': 3,
                                       'input': 'nums = [5, 4, -1, 7, 8]',
                                       'output': '23'}],
                   'hints': [   "Kadane's Algorithm: at each position, decide whether to extend the existing subarray "
                                'or start a new one.',
                                '`current_sum = max(num, current_sum + num)`.'],
                   'language': 'python',
                   'starter_code': 'def max_sub_array(nums: list[int]) -> int:\n'
                                   '    # Return largest subarray sum\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    int maxSubArray(vector<int>& nums) {\n'
                                                   '        return 0;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public int maxSubArray(int[] nums) {\n'
                                                    '        // Return largest subarray sum\n'
                                                    '        return 0;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {number[]} nums\n'
                                                          ' * @return {number}\n'
                                                          ' */\n'
                                                          'function maxSubArray(nums) {\n'
                                                          '    // Return largest subarray sum\n'
                                                          '    return 0;\n'
                                                          '}\n',
                                            'python': 'def max_sub_array(nums: list[int]) -> int:\n'
                                                      '    # Return largest subarray sum\n'
                                                      '    pass\n',
                                            'typescript': 'function maxSubArray(nums: number[]): number {\n'
                                                          '    // Return largest subarray sum\n'
                                                          '    return 0;\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': '6', 'input': 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]'},
                                     {'expected': '1', 'input': 'nums = [1]'},
                                     {'expected': '23', 'input': 'nums = [5, 4, -1, 7, 8]'}],
                   'title': 'Maximum Subarray'},
    'question_text': 'Given an integer array `nums`, find the contiguous subarray with the largest sum, and return its '
                     'sum.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'binary_search',
                          'language': 'python',
                          'test_cases': [   {   'args': [[-1, 0, 3, 5, 9, 12], 9],
                                                'expected': 4,
                                                'input_repr': 'nums = [-1, 0, 3, 5, 9, 12], target = 9'},
                                            {   'args': [[-1, 0, 3, 5, 9, 12], 2],
                                                'expected': -1,
                                                'input_repr': 'nums = [-1, 0, 3, 5, 9, 12], target = 2'},
                                            {'args': [[5], 5], 'expected': 0, 'input_repr': 'nums = [5], target = 5'},
                                            {   'args': [[2, 5], 5],
                                                'expected': 1,
                                                'input_repr': 'nums = [2, 5], target = 5'}]},
    'difficulty': DifficultyLevel.BEGINNER,
    'explanation': 'Standard binary search with two pointers. O(log N) time and O(1) space.',
    'options': {   'constraints': [   '1 <= nums.length <= 10^4',
                                      '-10^4 < nums[i], target < 10^4',
                                      'All the integers in `nums` are unique.',
                                      '`nums` is sorted in ascending order.'],
                   'description': 'Given an array of integers `nums` which is sorted in ascending order, and an '
                                  'integer `target`, write a function to search `target` in `nums`.\n'
                                  '\n'
                                  'If `target` exists, then return its index. Otherwise, return `-1`.\n'
                                  '\n'
                                  'You must write an algorithm with `O(log n)` runtime complexity.',
                   'examples': [   {   'explanation': '9 exists in nums and its index is 4.',
                                       'id': 1,
                                       'input': 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
                                       'output': '4'},
                                   {   'explanation': '2 does not exist in nums so return -1.',
                                       'id': 2,
                                       'input': 'nums = [-1, 0, 3, 5, 9, 12], target = 2',
                                       'output': '-1'}],
                   'hints': [   'Maintain two pointers `left` and `right`. Calculate `mid = (left + right) // 2`.',
                                'If `nums[mid] == target`, return `mid`. If `nums[mid] < target`, move `left = mid + '
                                '1`.'],
                   'language': 'python',
                   'starter_code': 'def binary_search(nums: list[int], target: int) -> int:\n'
                                   '    # Search target in sorted array nums\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    int binarySearch(vector<int>& nums, int target) {\n'
                                                   '        return -1;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public int binarySearch(int[] nums, int target) {\n'
                                                    '        // Search target in sorted array nums\n'
                                                    '        return -1;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {number[]} nums\n'
                                                          ' * @param {number} target\n'
                                                          ' * @return {number}\n'
                                                          ' */\n'
                                                          'function binarySearch(nums, target) {\n'
                                                          '    // Search target in sorted array nums\n'
                                                          '    return -1;\n'
                                                          '}\n',
                                            'python': 'def binary_search(nums: list[int], target: int) -> int:\n'
                                                      '    # Search target in sorted array nums\n'
                                                      '    pass\n',
                                            'typescript': 'function binarySearch(nums: number[], target: number): '
                                                          'number {\n'
                                                          '    // Search target in sorted array nums\n'
                                                          '    return -1;\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': '4', 'input': 'nums = [-1, 0, 3, 5, 9, 12], target = 9'},
                                     {'expected': '-1', 'input': 'nums = [-1, 0, 3, 5, 9, 12], target = 2'}],
                   'title': 'Binary Search'},
    'question_text': 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, '
                     'write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, '
                     'return `-1`. You must write an algorithm with `O(log n)` runtime complexity.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'climb_stairs',
                          'language': 'python',
                          'test_cases': [   {'args': [2], 'expected': 2, 'input_repr': 'n = 2'},
                                            {'args': [3], 'expected': 3, 'input_repr': 'n = 3'},
                                            {'args': [4], 'expected': 5, 'input_repr': 'n = 4'},
                                            {'args': [5], 'expected': 8, 'input_repr': 'n = 5'}]},
    'difficulty': DifficultyLevel.BEGINNER,
    'explanation': 'Fibonacci DP: ways(n) = ways(n-1) + ways(n-2). O(N) time and O(1) space.',
    'options': {   'constraints': ['1 <= n <= 45', 'Expected Time Complexity: O(N)', 'Expected Space Complexity: O(1)'],
                   'description': 'You are climbing a staircase. It takes `n` steps to reach the top.\n'
                                  '\n'
                                  'Each time you can either climb `1` or `2` steps. In how many distinct ways can you '
                                  'climb to the top?',
                   'examples': [   {   'explanation': 'There are two ways: (1 + 1) or (2).',
                                       'id': 1,
                                       'input': 'n = 2',
                                       'output': '2'},
                                   {   'explanation': 'There are three ways: (1 + 1 + 1), (1 + 2), or (2 + 1).',
                                       'id': 2,
                                       'input': 'n = 3',
                                       'output': '3'}],
                   'hints': [   'This is equivalent to the Fibonacci sequence: ways(n) = ways(n-1) + ways(n-2).',
                                'Store only the last two results instead of an entire array.'],
                   'language': 'python',
                   'starter_code': 'def climb_stairs(n: int) -> int:\n'
                                   '    # Return number of distinct ways to climb n steps\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    int climbStairs(int n) {\n'
                                                   '        return 0;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public int climbStairs(int n) {\n'
                                                    '        // Return distinct ways\n'
                                                    '        return 0;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {number} n\n'
                                                          ' * @return {number}\n'
                                                          ' */\n'
                                                          'function climbStairs(n) {\n'
                                                          '    // Return distinct ways\n'
                                                          '    return 0;\n'
                                                          '}\n',
                                            'python': 'def climb_stairs(n: int) -> int:\n'
                                                      '    # Return number of distinct ways to climb n steps\n'
                                                      '    pass\n',
                                            'typescript': 'function climbStairs(n: number): number {\n'
                                                          '    // Return distinct ways\n'
                                                          '    return 0;\n'
                                                          '}\n'},
                   'test_cases': [{'expected': '2', 'input': 'n = 2'}, {'expected': '3', 'input': 'n = 3'}],
                   'title': 'Climbing Stairs'},
    'question_text': 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either '
                     'climb `1` or `2` steps. In how many distinct ways can you climb to the top?',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'single_number',
                          'language': 'python',
                          'test_cases': [   {'args': [[2, 2, 1]], 'expected': 1, 'input_repr': 'nums = [2, 2, 1]'},
                                            {   'args': [[4, 1, 2, 1, 2]],
                                                'expected': 4,
                                                'input_repr': 'nums = [4, 1, 2, 1, 2]'},
                                            {'args': [[1]], 'expected': 1, 'input_repr': 'nums = [1]'}]},
    'difficulty': DifficultyLevel.BEGINNER,
    'explanation': 'Bitwise XOR of all numbers cancels pairs leaving the single number. O(N) time, O(1) space.',
    'options': {   'constraints': [   '1 <= nums.length <= 3 * 10^4',
                                      '-3 * 10^4 <= nums[i] <= 3 * 10^4',
                                      'Every element appears twice except for one which appears exactly once.'],
                   'description': 'Given a non-empty array of integers `nums`, every element appears twice except for '
                                  'one. Find that single one.\n'
                                  '\n'
                                  'You must implement a solution with a linear runtime complexity and use only '
                                  'constant extra space.',
                   'examples': [   {'id': 1, 'input': 'nums = [2, 2, 1]', 'output': '1'},
                                   {'id': 2, 'input': 'nums = [4, 1, 2, 1, 2]', 'output': '4'},
                                   {'id': 3, 'input': 'nums = [1]', 'output': '1'}],
                   'hints': [   'XOR operation properties: a ^ a = 0 and a ^ 0 = a.',
                                'XOR-ing all numbers cancels out the pairs, leaving only the unique number.'],
                   'language': 'python',
                   'starter_code': 'def single_number(nums: list[int]) -> int:\n'
                                   '    # Find the element that appears only once\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    int singleNumber(vector<int>& nums) {\n'
                                                   '        return 0;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public int singleNumber(int[] nums) {\n'
                                                    '        return 0;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {number[]} nums\n'
                                                          ' * @return {number}\n'
                                                          ' */\n'
                                                          'function singleNumber(nums) {\n'
                                                          '    return 0;\n'
                                                          '}\n',
                                            'python': 'def single_number(nums: list[int]) -> int:\n'
                                                      '    # Find the element that appears only once\n'
                                                      '    pass\n',
                                            'typescript': 'function singleNumber(nums: number[]): number {\n'
                                                          '    return 0;\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': '1', 'input': 'nums = [2, 2, 1]'},
                                     {'expected': '4', 'input': 'nums = [4, 1, 2, 1, 2]'},
                                     {'expected': '1', 'input': 'nums = [1]'}],
                   'title': 'Single Number'},
    'question_text': 'Given a non-empty array of integers `nums`, every element appears twice except for one. Find '
                     'that single one. You must implement a solution with linear runtime complexity and constant extra '
                     'space.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'move_zeroes',
                          'language': 'python',
                          'test_cases': [   {   'args': [[0, 1, 0, 3, 12]],
                                                'expected': [1, 3, 12, 0, 0],
                                                'input_repr': 'nums = [0, 1, 0, 3, 12]'},
                                            {'args': [[0]], 'expected': [0], 'input_repr': 'nums = [0]'},
                                            {   'args': [[1, 2, 3]],
                                                'expected': [1, 2, 3],
                                                'input_repr': 'nums = [1, 2, 3]'}]},
    'difficulty': DifficultyLevel.BEGINNER,
    'explanation': 'Two-pointer approach or filter non-zeros and append zeros. O(N) time.',
    'options': {   'constraints': ['1 <= nums.length <= 10^4', '-2^31 <= nums[i] <= 2^31 - 1'],
                   'description': "Given an integer array `nums`, move all `0`'s to the end of it while maintaining "
                                  'the relative order of the non-zero elements.\n'
                                  '\n'
                                  'Return the modified array.',
                   'examples': [   {'id': 1, 'input': 'nums = [0, 1, 0, 3, 12]', 'output': '[1, 3, 12, 0, 0]'},
                                   {'id': 2, 'input': 'nums = [0]', 'output': '[0]'}],
                   'hints': [   'Maintain a pointer `insert_pos` for where the next non-zero should be placed.',
                                'After copying non-zero elements, fill the rest with zeros.'],
                   'language': 'python',
                   'starter_code': 'def move_zeroes(nums: list[int]) -> list[int]:\n'
                                   '    # Move all 0s to end and return nums\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    vector<int> moveZeroes(vector<int>& nums) {\n'
                                                   '        return nums;\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public int[] moveZeroes(int[] nums) {\n'
                                                    '        return nums;\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {number[]} nums\n'
                                                          ' * @return {number[]}\n'
                                                          ' */\n'
                                                          'function moveZeroes(nums) {\n'
                                                          '    return nums;\n'
                                                          '}\n',
                                            'python': 'def move_zeroes(nums: list[int]) -> list[int]:\n'
                                                      '    # Move all 0s to end and return nums\n'
                                                      '    pass\n',
                                            'typescript': 'function moveZeroes(nums: number[]): number[] {\n'
                                                          '    return nums;\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': '[1, 3, 12, 0, 0]', 'input': 'nums = [0, 1, 0, 3, 12]'},
                                     {'expected': '[0]', 'input': 'nums = [0]'}],
                   'title': 'Move Zeroes'},
    'question_text': "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative "
                     'order of the non-zero elements. Return the modified array.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

    {   'correct_answer': {   'entry_point': 'product_except_self',
                          'language': 'python',
                          'test_cases': [   {   'args': [[1, 2, 3, 4]],
                                                'expected': [24, 12, 8, 6],
                                                'input_repr': 'nums = [1, 2, 3, 4]'},
                                            {   'args': [[-1, 1, 0, -3, 3]],
                                                'expected': [0, 0, 9, 0, 0],
                                                'input_repr': 'nums = [-1, 1, 0, -3, 3]'}]},
    'difficulty': DifficultyLevel.INTERMEDIATE,
    'explanation': 'Prefix and suffix product passes without division. O(N) time.',
    'options': {   'constraints': [   '2 <= nums.length <= 10^5',
                                      '-30 <= nums[i] <= 30',
                                      'The product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit '
                                      'integer.'],
                   'description': 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is '
                                  'equal to the product of all the elements of `nums` except `nums[i]`.\n'
                                  '\n'
                                  'The product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit '
                                  'integer.\n'
                                  '\n'
                                  'You must write an algorithm that runs in `O(n)` time and without using the division '
                                  'operation.',
                   'examples': [   {'id': 1, 'input': 'nums = [1, 2, 3, 4]', 'output': '[24, 12, 8, 6]'},
                                   {'id': 2, 'input': 'nums = [-1, 1, 0, -3, 3]', 'output': '[0, 0, 9, 0, 0]'}],
                   'hints': [   'Calculate prefix products in a left-to-right pass.',
                                'Calculate suffix products in a right-to-left pass and multiply them.'],
                   'language': 'python',
                   'starter_code': 'def product_except_self(nums: list[int]) -> list[int]:\n'
                                   '    # Return product of array except self\n'
                                   '    pass\n',
                   'starter_templates': {   'cpp': 'class Solution {\n'
                                                   'public:\n'
                                                   '    vector<int> productExceptSelf(vector<int>& nums) {\n'
                                                   '        return {};\n'
                                                   '    }\n'
                                                   '};\n',
                                            'java': 'class Solution {\n'
                                                    '    public int[] productExceptSelf(int[] nums) {\n'
                                                    '        return new int[]{};\n'
                                                    '    }\n'
                                                    '}\n',
                                            'javascript': '/**\n'
                                                          ' * @param {number[]} nums\n'
                                                          ' * @return {number[]}\n'
                                                          ' */\n'
                                                          'function productExceptSelf(nums) {\n'
                                                          '    return [];\n'
                                                          '}\n',
                                            'python': 'def product_except_self(nums: list[int]) -> list[int]:\n'
                                                      '    # Return product of array except self\n'
                                                      '    pass\n',
                                            'typescript': 'function productExceptSelf(nums: number[]): number[] {\n'
                                                          '    return [];\n'
                                                          '}\n'},
                   'test_cases': [   {'expected': '[24, 12, 8, 6]', 'input': 'nums = [1, 2, 3, 4]'},
                                     {'expected': '[0, 0, 9, 0, 0]', 'input': 'nums = [-1, 1, 0, -3, 3]'}],
                   'title': 'Product of Array Except Self'},
    'question_text': 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the '
                     'product of all the elements of `nums` except `nums[i]`. You must write an algorithm that runs in '
                     '`O(n)` time without using the division operation.',
    'question_type': QuestionType.CODE,
    'skill_tested': 'Python'},

# =========================================================================
    # --- CONCEPTUAL & ARCHITECTURAL QUESTIONS (QuestionType.MCQ / SCENARIO) ---
    # =========================================================================

    # --- PYTHON QUESTIONS ---
    {
        "skill_tested": "Python",
        "difficulty": DifficultyLevel.BEGINNER,
        "question_type": QuestionType.MCQ,
        "question_text": "In Python, which of the following data structures is immutable?",
        "options": ["List", "Dictionary", "Tuple", "Set"],
        "correct_answer": "Tuple",
        "explanation": "Tuples in Python cannot be modified in-place after creation, making them immutable."
    },
    {
        "skill_tested": "Python",
        "difficulty": DifficultyLevel.BEGINNER,
        "question_type": QuestionType.MCQ,
        "question_text": "What is the output of `bool([])` in Python?",
        "options": ["True", "False", "None", "TypeError"],
        "correct_answer": "False",
        "explanation": "Empty collections like lists, dicts, and sets evaluate to False in a boolean context."
    },
    {
        "skill_tested": "Python",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "question_type": QuestionType.MCQ,
        "question_text": "What is the primary difference between `deepcopy` and `copy` in Python's `copy` module?",
        "options": [
            "deepcopy creates copies of nested objects recursively, while copy copies only top-level references.",
            "copy allocates memory on the heap while deepcopy uses stack frames.",
            "deepcopy only works with primitive types.",
            "There is no difference; they are aliases."
        ],
        "correct_answer": "deepcopy creates copies of nested objects recursively, while copy copies only top-level references.",
        "explanation": "Shallow copy creates a new compound object and inserts references into it. Deep copy creates a new object and recursively inserts copies of the objects found in the original."
    },
    {
        "skill_tested": "Python",
        "difficulty": DifficultyLevel.ADVANCED,
        "question_type": QuestionType.SCENARIO,
        "question_text": "A CPU-bound multiprocessing worker hangs intermittently on Linux when spawning threads prior to `os.fork()`. What is the fundamental cause?",
        "options": [
            "Fork without exec duplicates only the calling thread, potentially leaving mutexes locked by other threads in an unrecoverable deadlock.",
            "Python's GIL is completely disabled across child processes.",
            "File descriptors are automatically closed upon forking in Unix.",
            "Python 3 does not permit multiprocessing with threads."
        ],
        "correct_answer": "Fork without exec duplicates only the calling thread, potentially leaving mutexes locked by other threads in an unrecoverable deadlock.",
        "explanation": "Calling fork() in a multithreaded process duplicates only the thread that called fork. If any other thread was holding an internal lock or memory allocator mutex, the child process deadlocks."
    },
    {
        "skill_tested": "Python",
        "difficulty": DifficultyLevel.ADVANCED,
        "question_type": QuestionType.MCQ,
        "question_text": "How does Python resolve method calls in multiple inheritance hierarchy?",
        "options": [
            "C3 Linearization algorithm (Method Resolution Order - MRO)",
            "Depth-First Search (DFS) strictly left-to-right without cycle checking",
            "Breadth-First Search (BFS) starting from object base",
            "Arbitrary order determined at runtime by memory layout"
        ],
        "correct_answer": "C3 Linearization algorithm (Method Resolution Order - MRO)",
        "explanation": "Python uses the C3 Linearization algorithm to enforce monotonicity and consistency in multiple inheritance hierarchies."
    },

    # --- SQL QUESTIONS ---
    {
        "skill_tested": "SQL",
        "difficulty": DifficultyLevel.BEGINNER,
        "question_type": QuestionType.MCQ,
        "question_text": "Which SQL clause is used to filter aggregated rows produced by a `GROUP BY` statement?",
        "options": ["HAVING", "WHERE", "ORDER BY", "FILTER"],
        "correct_answer": "HAVING",
        "explanation": "WHERE filters rows before aggregation; HAVING filters groups after aggregation."
    },
    {
        "skill_tested": "SQL",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "question_type": QuestionType.MCQ,
        "question_text": "What is the key difference between `RANK()` and `DENSE_RANK()` window functions?",
        "options": [
            "RANK leaves gaps in the sequence after duplicate values, whereas DENSE_RANK leaves no gaps.",
            "DENSE_RANK requires a partition clause while RANK does not.",
            "RANK returns floating point values while DENSE_RANK returns integers.",
            "DENSE_RANK is only supported in SQLite."
        ],
        "correct_answer": "RANK leaves gaps in the sequence after duplicate values, whereas DENSE_RANK leaves no gaps.",
        "explanation": "When ties occur, RANK skips subsequent numbers (e.g., 1, 2, 2, 4), whereas DENSE_RANK maintains continuous numbers (1, 2, 2, 3)."
    },
    {
        "skill_tested": "SQL",
        "difficulty": DifficultyLevel.ADVANCED,
        "question_type": QuestionType.SCENARIO,
        "question_text": "Under PostgreSQL's `READ COMMITTED` isolation level, how does a transaction handle a concurrent `UPDATE` on a row that satisfies its `WHERE` predicate?",
        "options": [
            "It re-evaluates the query's WHERE clause against the newly committed version of the updated row before applying the write.",
            "It immediately fails with a serialization failure error (40001).",
            "It silently overwrites the previous commit without rechecking the predicate.",
            "It enters an unresolvable distributed deadlock."
        ],
        "correct_answer": "It re-evaluates the query's WHERE clause against the newly committed version of the updated row before applying the write.",
        "explanation": "In Read Committed, an UPDATE or DELETE that finds a concurrent update will wait for the first transaction to commit, then re-evaluates the WHERE clause on the new tuple version."
    },

    # --- MACHINE LEARNING QUESTIONS ---
    {
        "skill_tested": "Machine Learning",
        "difficulty": DifficultyLevel.BEGINNER,
        "question_type": QuestionType.MCQ,
        "question_text": "What problem occurs when a model performs exceptionally well on training data but poorly on unseen test data?",
        "options": ["Overfitting", "Underfitting", "Data drift", "High bias"],
        "correct_answer": "Overfitting",
        "explanation": "Overfitting occurs when a model memorizes noise and specific details of the training set rather than generalizing."
    },
    {
        "skill_tested": "Machine Learning",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "question_type": QuestionType.MCQ,
        "question_text": "When evaluating an imbalanced binary classification dataset where positive class represents fraud (1% prevalence), which metric is most informative?",
        "options": [
            "PR-AUC (Precision-Recall Area Under Curve)",
            "Accuracy",
            "Mean Squared Error",
            "R-squared"
        ],
        "correct_answer": "PR-AUC (Precision-Recall Area Under Curve)",
        "explanation": "Accuracy is misleading in severe class imbalance; Precision-Recall AUC directly focuses on true positives and false positives without being inflated by true negatives."
    },
    {
        "skill_tested": "Machine Learning",
        "difficulty": DifficultyLevel.ADVANCED,
        "question_type": QuestionType.SCENARIO,
        "question_text": "In tree-based gradient boosting (e.g., LightGBM / XGBoost), why does adding L1 regularization (alpha) to leaf weights encourage sparsity compared to L2 (lambda)?",
        "options": [
            "The derivative of the L1 penalty is constant at the origin, driving leaf values to exactly zero when the loss gradient is smaller than alpha.",
            "L1 regularization restricts the maximum tree depth to log2(N).",
            "L2 regularization completely zeroes out feature splits.",
            "LightGBM only supports L2 regularization."
        ],
        "correct_answer": "The derivative of the L1 penalty is constant at the origin, driving leaf values to exactly zero when the loss gradient is smaller than alpha.",
        "explanation": "The L1 penalty produces a constant gradient force towards 0.0 regardless of magnitude, enabling exact soft-thresholding to zero."
    },

    # --- REACT / FRONTEND QUESTIONS ---
    {
        "skill_tested": "React",
        "difficulty": DifficultyLevel.BEGINNER,
        "question_type": QuestionType.MCQ,
        "question_text": "Which React hook is used to perform side effects such as data fetching and DOM manipulation in functional components?",
        "options": ["useEffect", "useState", "useContext", "useReducer"],
        "correct_answer": "useEffect",
        "explanation": "useEffect serves the purpose of lifecycle side-effects in functional React components."
    },
    {
        "skill_tested": "React",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "question_type": QuestionType.MCQ,
        "question_text": "When should you prefer `useCallback` over regular inline function definitions in React?",
        "options": [
            "When passing callbacks to optimized child components that rely on reference equality (`React.memo`).",
            "Every single function in React must be wrapped with useCallback for performance.",
            "Only when communicating with WebSockets.",
            "To replace `useMemo` for heavy calculations."
        ],
        "correct_answer": "When passing callbacks to optimized child components that rely on reference equality (`React.memo`).",
        "explanation": "useCallback caches function instances between renders, preventing unwanted re-renders of memoized children that check props by shallow equality."
    },
    {
        "skill_tested": "React",
        "difficulty": DifficultyLevel.ADVANCED,
        "question_type": QuestionType.SCENARIO,
        "question_text": "What is the primary benefit of React 18 Concurrent Rendering and `useTransition`?",
        "options": [
            "It allows marking non-urgent state updates as interruptible transitions, keeping the user interface responsive during heavy renders.",
            "It runs React components on background Web Workers automatically.",
            "It eliminates the need for Virtual DOM diffing.",
            "It executes async database queries directly from JSX."
        ],
        "correct_answer": "It allows marking non-urgent state updates as interruptible transitions, keeping the user interface responsive during heavy renders.",
        "explanation": "React's concurrent architecture lets React pause rendering an update to handle high-priority user inputs (like typing or clicking)."
    },

    # --- DOCKER & DEVOPS QUESTIONS ---
    {
        "skill_tested": "Docker",
        "difficulty": DifficultyLevel.BEGINNER,
        "question_type": QuestionType.MCQ,
        "question_text": "Which Dockerfile instruction sets the default executable command when a container starts?",
        "options": ["CMD", "FROM", "RUN", "COPY"],
        "correct_answer": "CMD",
        "explanation": "CMD specifies default arguments for an executing container."
    },
    {
        "skill_tested": "Docker",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "question_type": QuestionType.MCQ,
        "question_text": "Why are multi-stage Docker builds recommended in production CI/CD pipelines?",
        "options": [
            "They separate build dependencies from the final lightweight runtime image, reducing image size and security attack surface.",
            "They allow running multiple operating systems simultaneously in one container.",
            "They bypass Docker image layer caching.",
            "They eliminate the need for Dockerfiles."
        ],
        "correct_answer": "They separate build dependencies from the final lightweight runtime image, reducing image size and security attack surface.",
        "explanation": "Multi-stage builds permit compiling in a heavy stage with toolchains, and copying only the compiled artifacts into a clean minimal runtime."
    },
    {
        "skill_tested": "Docker",
        "difficulty": DifficultyLevel.ADVANCED,
        "question_type": QuestionType.SCENARIO,
        "question_text": "When running high-load containerized services in Kubernetes, why might a container receive a `SIGKILL` (OOMKilled exit code 137) rather than graceful shutdown?",
        "options": [
            "The Linux cgroups memory limit was exceeded, causing the Linux kernel OOM-killer to terminate the process immediately.",
            "Kubernetes sent a liveness probe failure.",
            "The CPU quota was throttled.",
            "The pod network bridge crashed."
        ],
        "correct_answer": "The Linux cgroups memory limit was exceeded, causing the Linux kernel OOM-killer to terminate the process immediately.",
        "explanation": "When container memory surpasses its memory limit, the Linux kernel cgroup controller invokes the OOM-killer, dispatching an untrappable SIGKILL."
    }
]

def validate_question(q: Dict[str, Any]) -> bool:
    """Validate question format and invariants for both MCQ and CODE challenges."""
    if q.get("question_type") == QuestionType.CODE:
        return all(k in q for k in ["skill_tested", "difficulty", "question_text", "options", "correct_answer"])
    required = ["skill_tested", "difficulty", "question_text", "options", "correct_answer"]
    if not all(k in q for k in required):
        return False
    if not isinstance(q["options"], list) or len(q["options"]) < 2:
        return False
    if q["correct_answer"] not in q["options"] and q.get("question_type") != QuestionType.SHORT_ANSWER:
        return False
    return True
