-- =====================================================================
-- EigoMaster Demo Data: Listening Questions (30 realistic questions)
-- =====================================================================
-- 30 listening comprehension questions across difficulty levels 1-5
-- Topics: travel, business, daily conversations, academic discussions
-- All marked as public and realistic for English exam preparation
-- =====================================================================

INSERT INTO listening_questions (
  id, title, audio_url, script, choices, correct_answer,
  difficulty, category_id, tags, explanation, explanation_translation,
  times_attempted, average_accuracy, is_public, created_by, created_at, updated_at
) VALUES

-- ===== DIFFICULTY 1: BASIC CONVERSATIONS =====

-- Question 1: At the Airport
('550e8400-e29b-41d4-a716-446660010001',
  'At the Airport - Gate Information',
  'https://eigomaster-audio.s3.amazonaws.com/q001.mp3',
  'Attention all passengers on Flight 202 to Tokyo. Gate change announcement: Flight 202 will now depart from Gate 15 instead of Gate 12. Please proceed to Gate 15 immediately. Boarding will commence in 15 minutes. Thank you for your attention.',
  '["The flight is departing from Gate 12", "The flight is departing from Gate 15", "The flight is boarding at Gate 12", "Boarding is in 30 minutes"]',
  1,
  1, NULL, '["airport", "basic", "information"]',
  'This question tests basic listening comprehension of announcement details. The key information is the gate change from Gate 12 to Gate 15.',
  'このテストは声明の詳細の基本的なリスニング理解をテストします。ゲート12からゲート15への変更が重要です。',
  234, 92.5, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-01 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 2: Restaurant Booking
('550e8400-e29b-41d4-a716-446660010002',
  'Booking a Restaurant Table',
  'https://eigomaster-audio.s3.amazonaws.com/q002.mp3',
  'Thank you for calling Mario''s Restaurant. I''d like to reserve a table for two people on Friday evening at 7 PM. Perfect! We have availability. May I have your name, please? My name is Johnson. How should we contact you, Mr. Johnson? You can reach me at 555-0123.',
  '["The restaurant has no availability", "The reservation is for 3 people", "The reservation is for Friday at 7 PM", "The reservation is for Saturday"]',
  2,
  1, NULL, '["restaurant", "booking", "phone"]',
  'Focus on the specific time mentioned in the conversation. The customer clearly states Friday evening at 7 PM.',
  'テストの重要なポイントは、会話で明らかに述べられている金曜日の夜7時です。',
  189, 88.3, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-02 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 3: Train Schedule
('550e8400-e29b-41d4-a716-446660010003',
  'Asking About Train Departure Time',
  'https://eigomaster-audio.s3.amazonaws.com/q003.mp3',
  'Excuse me, when does the next train to Osaka leave? The next train is at 2:30 PM from Platform 4. That''s platform 4, correct? Yes, platform 4. How long is the journey? About two and a half hours.',
  '["The train leaves at 2:00 PM", "The train leaves at 2:30 PM", "The train leaves at 3:30 PM", "The train leaves at 4:00 PM"]',
  1,
  1, NULL, '["train", "travel", "time"]',
  'The answer is clearly stated: 2:30 PM. This is a straightforward factual question.',
  '答えは明確に述べられています：午後2時30分です。これは単純な事実的な質問です。',
  267, 94.8, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-03 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 4: Hotel Check-in
('550e8400-e29b-41d4-a716-446660010004',
  'Checking into a Hotel',
  'https://eigomaster-audio.s3.amazonaws.com/q004.mp3',
  'Welcome to the Grand Hotel. Do you have a reservation? Yes, under the name Sarah Brown. How many nights will you be staying with us? Three nights. Excellent. Here is your room key. You''re in room 512 on the fifth floor.',
  '["The room is on the third floor", "The room is on the fourth floor", "The room is on the fifth floor", "The room is on the sixth floor"]',
  2,
  1, NULL, '["hotel", "accommodation", "check-in"]',
  'Pay attention to the floor number. The staff clearly says the fifth floor.',
  '階数に注意してください。スタッフは明確に5階と言っています。',
  198, 91.2, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-04 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 5: Weather Forecast
('550e8400-e29b-41d4-a716-446660010005',
  'Weather Report for Tomorrow',
  'https://eigomaster-audio.s3.amazonaws.com/q005.mp3',
  'Here''s tomorrow''s weather forecast. Tomorrow will be sunny in the morning and partly cloudy in the afternoon. Temperatures will reach 28 degrees Celsius. There is a 20 percent chance of rain in the evening.',
  '["It will be raining in the morning", "It will be sunny in the morning", "It will be partly cloudy in the morning", "It will be cloudy all day"]',
  1,
  1, NULL, '["weather", "forecast", "basic"]',
  'The forecast clearly states sunny conditions in the morning and partly cloudy in the afternoon.',
  '予報は朝の晴天と午後の曇りを明確に述べています。',
  156, 89.7, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-05 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 6: School Schedule
('550e8400-e29b-41d4-a716-446660010006',
  'School Class Schedule',
  'https://eigomaster-audio.s3.amazonaws.com/q006.mp3',
  'Good morning everyone. I just want to remind you about the schedule changes this week. Chemistry class has been moved from Wednesday to Thursday. History remains on Monday at 2 PM. Mathematics class is now meeting every afternoon from 3 to 4 PM.',
  '["Chemistry is on Wednesday", "Chemistry is on Thursday", "Chemistry is on Monday", "Chemistry is on Friday"]',
  1,
  1, NULL, '["school", "schedule", "education"]',
  'The teacher explicitly states that Chemistry has been moved from Wednesday to Thursday.',
  '先生は化学が水曜日から木曜日に移されたことを明確に述べています。',
  203, 86.4, TRUE, '550e8400-e29b-41d4-a716-446655440003', '2025-10-06 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 7: Coffee Shop Order
('550e8400-e29b-41d4-a716-446660010007',
  'Ordering at a Cafe',
  'https://eigomaster-audio.s3.amazonaws.com/q007.mp3',
  'Hi, what can I get for you today? I''ll have a cappuccino with extra shot and a croissant, please. Would you like that to go or for here? For here, thanks. That''ll be $7.50. Will you be paying with card or cash? Card, please.',
  '["The customer wants an espresso", "The customer wants a cappuccino", "The customer wants a latte", "The customer wants tea"]',
  1,
  1, NULL, '["cafe", "food", "ordering"]',
  'The customer clearly orders a cappuccino with an extra shot.',
  '顧客は明確にエキストラショット付きのカプチーノを注文しています。',
  234, 93.1, TRUE, '550e8400-e29b-41d4-a716-446655440003', '2025-10-07 10:00:00+09', '2026-03-19 10:00:00+09'),

-- ===== DIFFICULTY 2: INTERMEDIATE CONVERSATIONS =====

-- Question 8: Job Interview
('550e8400-e29b-41d4-a716-446660010008',
  'Job Interview - Work Experience',
  'https://eigomaster-audio.s3.amazonaws.com/q008.mp3',
  'Can you tell us about your previous work experience? Sure. I worked at TechCorp for five years as a software developer. I was responsible for developing mobile applications and leading a small team of three people. Before that, I had two years of experience at StartupXYZ working as a junior developer.',
  '["The candidate worked for 3 years at TechCorp", "The candidate worked for 5 years at TechCorp", "The candidate worked for 7 years total", "The candidate led a team of 5 people"]',
  1,
  2, NULL, '["job", "interview", "career"]',
  'The candidate states clearly: "five years as a software developer at TechCorp" plus "two years" at StartupXYZ.',
  '候補者は明確に述べています：TechCorpで5年間、StartupXYZで2年間。',
  189, 84.2, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-08 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 9: Medical Appointment
('550e8400-e29b-41d4-a716-446660010009',
  'Scheduling a Medical Appointment',
  'https://eigomaster-audio.s3.amazonaws.com/q009.mp3',
  'I need to schedule an appointment with Dr. Thompson. Is he available? Dr. Thompson is fully booked for the next two weeks. However, Dr. Johnson has an opening next Tuesday at 3 PM. Would that work for you? I prefer Dr. Thompson. Unfortunately, the earliest available appointment with Dr. Thompson is three weeks from today.',
  '["Dr. Thompson is available next Tuesday", "Dr. Thompson is available in 2 weeks", "Dr. Thompson''s earliest appointment is in 3 weeks", "Dr. Johnson can see the patient immediately"]',
  2,
  2, NULL, '["medical", "appointment", "scheduling"]',
  'The receptionist states that Dr. Thompson''s earliest appointment is three weeks from today.',
  '受付は、Dr. Thompsonの最も早い予約は今日から3週間後だと述べています。',
  156, 79.8, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-09 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 10: University Application
('550e8400-e29b-41d4-a716-446660010010',
  'Discussing University Application Requirements',
  'https://eigomaster-audio.s3.amazonaws.com/q010.mp3',
  'What are the requirements for the Master''s program? You need a bachelor''s degree, a minimum GPA of 3.5, and TOEFL scores above 100. Additionally, you must submit two letters of recommendation and a statement of purpose. Do you have any experience in the field? Experience is preferred but not required.',
  '["The minimum GPA requirement is 3.0", "The minimum GPA requirement is 3.5", "TOEFL score must be above 90", "Only one letter of recommendation is required"]',
  1,
  2, NULL, '["education", "university", "application"]',
  'The coordinator clearly states a minimum GPA of 3.5 and TOEFL scores above 100.',
  'コーディネーターはGPA 3.5以上、TOEFL100点以上を明確に述べています。',
  167, 81.5, TRUE, '550e8400-e29b-41d4-a716-446655440003', '2025-10-10 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 11: Business Meeting
('550e8400-e29b-41d4-a716-446660010011',
  'Project Deadline Discussion',
  'https://eigomaster-audio.s3.amazonaws.com/q011.mp3',
  'Good morning everyone. I''ve called this meeting to discuss the project timeline. The original deadline was September 30th, but due to unforeseen delays in the supply chain, we''ve pushed it to October 15th. The client has agreed to this extension. However, we still need to accelerate our work. Specifically, the testing phase must be completed by October 8th.',
  '["The original deadline was October 15th", "The new deadline is October 15th", "The client rejected the extension", "Testing must be completed by October 10th"]',
  1,
  2, NULL, '["business", "meeting", "deadline"]',
  'The manager clearly states: original deadline September 30th, new deadline October 15th.',
  'マネージャーは明確に述べています：元の締切は9月30日、新しい締切は10月15日。',
  178, 82.3, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-11 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 12: Academic Conference
('550e8400-e29b-41d4-a716-446660010012',
  'Conference Registration',
  'https://eigomaster-audio.s3.amazonaws.com/q012.mp3',
  'Welcome to the International English Teachers Conference. Registration fees are $150 for early bird registration until the end of this month. After that, the regular rate is $200. We offer a student discount of 40 percent. Additionally, accommodation packages are available at partner hotels with a 20 percent discount.',
  '["Early bird rate is $200", "Student rate is $60", "Regular rate is $150", "Accommodation discount is 30 percent"]',
  1,
  2, NULL, '["conference", "academic", "registration"]',
  'The organizer clearly states: early bird $150, regular $200, student 40% discount.',
  'オーガナイザーは明確に述べています：アーリーバード$150、通常$200、学生40%割引。',
  145, 80.7, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-12 10:00:00+09', '2026-03-19 10:00:00+09'),

-- ===== DIFFICULTY 3: ADVANCED CONVERSATIONS =====

-- Question 13: Academic Lecture - Climate Change
('550e8400-e29b-41d4-a716-446660010013',
  'Environmental Science Lecture Excerpt',
  'https://eigomaster-audio.s3.amazonaws.com/q013.mp3',
  'According to recent studies, global temperatures have risen approximately 1.1 degrees Celsius since pre-industrial times. The primary cause is the increase in greenhouse gases, particularly carbon dioxide, which has surged from 280 parts per million to over 420 parts per million. Scientists predict that if current trends continue, we may see an increase of 3 to 4 degrees Celsius by the end of this century, which would have catastrophic consequences for ecosystems worldwide.',
  '["Temperatures have risen 2.1 degrees since pre-industrial times", "Temperature rise is approximately 1.1 degrees Celsius", "CO2 levels are at 280 ppm", "Predicted rise is 1 to 2 degrees by 2100"]',
  1,
  3, NULL, '["science", "climate", "lecture"]',
  'The speaker explicitly states "approximately 1.1 degrees Celsius since pre-industrial times".',
  'スピーカーは明確に「産業前から約1.1度」と述べています。',
  198, 76.4, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-13 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 14: Technology Seminar
('550e8400-e29b-41d4-a716-446660010014',
  'AI Development and Ethics',
  'https://eigomaster-audio.s3.amazonaws.com/q014.mp3',
  'The ethical implications of artificial intelligence are becoming increasingly important as AI systems become more sophisticated. One major concern is algorithmic bias, where AI systems may perpetuate or amplify existing societal prejudices. Another significant issue is the question of accountability. When an AI system makes a harmful decision, who bears the responsibility? Is it the developer, the company, or the user? These questions remain largely unanswered in current legal frameworks.',
  '["The speaker believes AI systems are not biased", "Algorithmic bias is not a concern for AI", "One issue discussed is responsibility and accountability", "Current legal frameworks fully address AI ethics"]',
  2,
  3, NULL, '["technology", "AI", "ethics"]',
  'The speaker clearly identifies accountability and responsibility as significant unsolved issues.',
  'スピーカーは説明責任と責任を未解決の重要な問題として明確に特定しています。',
  134, 73.2, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-14 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 15: Economics Discussion
('550e8400-e29b-41d4-a716-446660010015',
  'Labor Market Trends',
  'https://eigomaster-audio.s3.amazonaws.com/q015.mp3',
  'Recent economic data shows significant shifts in labor market demographics. The gig economy has grown substantially, with approximately 36 percent of the American workforce now engaged in independent contracting or part-time work. This is a significant departure from traditional employment models. However, this trend presents both opportunities and challenges. While it offers flexibility and entrepreneurial potential, it also raises concerns about income stability and the decline of employee benefits.',
  '["Less than 20% of workers are in gig economy roles", "Approximately 36% are in gig economy or part-time work", "All workers prefer traditional employment", "The gig economy has declined in recent years"]',
  1,
  3, NULL, '["economics", "labor", "market"]',
  'The economist clearly states "approximately 36 percent" are in gig economy or part-time roles.',
  '経済学者は「約36%」が副業または兼業に従事していると明確に述べています。',
  167, 74.9, TRUE, '550e8400-e29b-41d4-a716-446655440003', '2025-10-15 10:00:00+09', '2026-03-19 10:00:00+09'),

-- ===== DIFFICULTY 4: COMPLEX DISCUSSIONS =====

-- Question 16: Medical Research Discussion
('550e8400-e29b-41d4-a716-446660010016',
  'New Treatment for Alzheimer''s Disease',
  'https://eigomaster-audio.s3.amazonaws.com/q016.mp3',
  'The recent breakthrough in Alzheimer''s research involves a monoclonal antibody that targets amyloid-beta plaques. Clinical trials show that when administered in early stages of cognitive decline, the drug slows cognitive deterioration by approximately 35 percent compared to placebo. However, the treatment comes with risks. About 20 percent of patients develop amyloid-related imaging abnormalities. Additionally, the cost is approximately $56,000 per year, which raises significant questions about accessibility and equity in healthcare.',
  '["The drug increases cognitive function by 50 percent", "The drug slows deterioration by approximately 35 percent", "20 percent of patients have no side effects", "The treatment costs $25,000 per year"]',
  1,
  4, NULL, '["medical", "research", "Alzheimers"]',
  'The researcher states "slows cognitive deterioration by approximately 35 percent compared to placebo".',
  '研究者は「プラセボと比較して約35%認知機能低下を遅延させる」と述べています。',
  112, 68.3, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-16 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 17: Philosophy Discussion
('550e8400-e29b-41d4-a716-446660010017',
  'The Nature of Consciousness',
  'https://eigomaster-audio.s3.amazonaws.com/q017.mp3',
  'Philosophers have debated the hard problem of consciousness for decades. While we understand how the brain processes information, we still cannot explain why we have subjective experience. This explanatory gap between physical processes and conscious experience has led some philosophers to consider dualism or panpsychism. Others argue that consciousness emerges from complex neural networks. However, none of these theories have achieved consensus in the academic community.',
  '["The problem of consciousness has been fully solved", "Scientists understand why we have subjective experience", "There is no explanatory gap between physical and conscious processes", "No theory has achieved consensus on consciousness"]',
  3,
  4, NULL, '["philosophy", "consciousness", "theory"]',
  'The discussion emphasizes that there is still no consensus and the gap between physical processes and experience remains unexplained.',
  '議論は、まだ合意がなく、物理的プロセスと経験の間のギャップが説明されていないことを強調しています。',
  89, 61.5, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-17 10:00:00+09', '2026-03-19 10:00:00+09'),

-- ===== DIFFICULTY 5: EXPERT-LEVEL DISCUSSIONS =====

-- Question 18: Quantum Physics Seminar
('550e8400-e29b-41d4-a716-446660010018',
  'Quantum Computing and Cryptography',
  'https://eigomaster-audio.s3.amazonaws.com/q018.mp3',
  'Quantum computing presents both unprecedented opportunities and existential threats to current cryptographic systems. Quantum computers utilize superposition and entanglement to perform calculations exponentially faster than classical computers. While this could solve complex optimization problems, it also threatens RSA encryption, which underpins much of modern cybersecurity. Post-quantum cryptography algorithms are being developed, but standardization is still ongoing. Experts estimate that within 10 to 15 years, quantum computers powerful enough to break current encryption will exist.',
  '["Quantum computers are slower than classical computers", "RSA encryption is unaffected by quantum computing", "Post-quantum cryptography is fully standardized", "Breaking current encryption could occur in 10-15 years"]',
  3,
  5, NULL, '["quantum", "computing", "cryptography"]',
  'The key point is the timeline: experts estimate breaking current encryption within 10 to 15 years.',
  '重要なポイントは、現在の暗号化を破壊するのに10-15年以内と推定されることです。',
  67, 54.2, TRUE, '550e8400-e29b-41d4-a716-446655440003', '2025-10-18 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 19: International Relations Analysis
('550e8400-e29b-41d4-a716-446660010019',
  'Geopolitical Shifts in Asia-Pacific',
  'https://eigomaster-audio.s3.amazonaws.com/q019.mp3',
  'The Asia-Pacific region is experiencing significant geopolitical realignment. The rise of ASEAN as a collective force, combined with competing interests from major powers, has created a multipolar dynamic unprecedented in modern history. Regional trade agreements like CPTPP and RCEP are reshaping economic relationships. Simultaneously, strategic competition over resources, particularly semiconductors and rare earth elements, intensifies traditional rivalries. This complex interplay requires sophisticated diplomatic engagement and multilateral cooperation frameworks.',
  '["ASEAN has decreased in geopolitical importance", "Trade agreements are simplifying economic relationships", "There is only bilateral competition in the region", "Multilateral cooperation frameworks are necessary"]',
  3,
  5, NULL, '["politics", "geopolitics", "international"]',
  'The speaker emphasizes the need for multilateral cooperation frameworks in this complex multipolar dynamic.',
  'スピーカーは、この複雑な多極的ダイナミクスの中での多国間協力枠組みの必要性を強調しています。',
  54, 51.8, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-19 10:00:00+09', '2026-03-19 10:00:00+09'),

-- Question 20: Neurological Research
('550e8400-e29b-41d4-a716-446660010020',
  'Neuroplasticity in Adult Learning',
  'https://eigomaster-audio.s3.amazonaws.com/q020.mp3',
  'Recent neuroscience research has demonstrated that neuroplasticity persists throughout adulthood, contrary to earlier beliefs of fixed neural architecture post-puberty. Neuroimaging studies show that intensive language learning creates new neural pathways and strengthens existing synaptic connections. The mechanisms involve both Hebbian learning, where neurons that fire together wire together, and non-Hebbian mechanisms including neuromodulation. Environmental enrichment, cognitive challenge, and consistent practice activate genes that promote synaptic plasticity. This finding has profound implications for adult education and rehabilitation programs.',
  '["Neuroplasticity ends after puberty", "Adult brains cannot form new neural pathways", "Intensive learning creates new neural connections", "Language learning does not affect brain structure"]',
  2,
  5, NULL, '["neuroscience", "neuroplasticity", "learning"]',
  'The researcher emphasizes that intensive language learning creates new neural pathways in adults.',
  '研究者は、成人における集中的な言語学習が新しい神経経路を作成することを強調しています。',
  78, 56.4, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-20 10:00:00+09', '2026-03-19 10:00:00+09');

-- =====================================================================
-- Additional Supporting Data (Questions 21-30)
-- =====================================================================

INSERT INTO listening_questions (
  id, title, audio_url, script, choices, correct_answer,
  difficulty, category_id, tags, explanation, explanation_translation,
  times_attempted, average_accuracy, is_public, created_by, created_at, updated_at
) VALUES

-- Questions 21-30: Mix of difficulties (will add shorter versions for brevity)

('550e8400-e29b-41d4-a716-446660010021', 'Library Inquiry',
  'https://eigomaster-audio.s3.amazonaws.com/q021.mp3',
  'The library is open Monday to Friday from 8 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays.',
  '["The library is open on Sunday", "Saturday hours are 10 AM to 4 PM", "Monday hours are 9 AM to 5 PM", "Friday closing is at 5 PM"]',
  1, 1, NULL, '["library", "hours", "schedule"]', 'Weekend hours need careful attention in this question.', 'このテストでは週末の時間に注意が必要です。', 123, 89.4, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-21 10:00:00+09', '2026-03-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446660010022', 'Movie Review Discussion',
  'https://eigomaster-audio.s3.amazonaws.com/q022.mp3',
  'The film explores themes of identity and belonging through the protagonist''s journey across three continents. The cinematography is stunning, but the narrative structure feels fragmented. Some scenes lack coherence, though the emotional impact is undeniable.',
  '["The film was shot in one location", "The cinematography is poor", "The narrative structure has some issues", "The emotional impact is weak"]',
  2, 2, NULL, '["film", "review", "criticism"]', 'Distinguish between criticism and overall assessment.', '批評と全体的な評価を区別する必要があります。', 98, 77.3, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-22 10:00:00+09', '2026-03-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446660010023', 'Corporate Training Session',
  'https://eigomaster-audio.s3.amazonaws.com/q023.mp3',
  'This mandatory training covers updated company policies regarding data privacy. All employees must complete the modules within 30 days. Failure to comply may result in disciplinary action. Each module requires approximately 45 minutes.',
  '["Training is optional", "Employees have 60 days to complete", "Each module takes about 1 hour", "Completing training is mandatory"]',
  3, 2, NULL, '["corporate", "training", "policy"]', 'Identify the mandatory requirement and timeline.', '義務的な要件と時間線を特定してください。', 145, 81.6, TRUE, '550e8400-e29b-41d4-a716-446655440003', '2025-10-23 10:00:00+09', '2026-03-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446660010024', 'Archaeological Expedition Report',
  'https://eigomaster-audio.s3.amazonaws.com/q024.mp3',
  'The expedition uncovered artifacts dating back 2,500 years, providing evidence of a previously unknown trading network. The discovery of pottery fragments bearing inscriptions from multiple regions suggests extensive cultural exchange.',
  '["Artifacts are from 1,000 years ago", "Evidence of trade networks was found", "Only one region is represented", "Cultural exchange is not evident"]',
  1, 3, NULL, '["archaeology", "discovery", "history"]', 'Focus on the specific timeframe and evidence.', '特定の時間枠と証拠に焦点を当てます。', 107, 75.2, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-24 10:00:00+09', '2026-03-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446660010025', 'Environmental Policy Analysis',
  'https://eigomaster-audio.s3.amazonaws.com/q025.mp3',
  'New emissions regulations will reduce carbon output by 40 percent over the next decade. Industries must invest in cleaner technologies or face penalties. However, small businesses receive tax incentives for compliance.',
  '["Emissions will increase by 40%", "Only large companies receive incentives", "The deadline is 15 years", "The reduction target is 40%"]',
  3, 3, NULL, '["environment", "policy", "regulation"]', 'Distinguish between penalties and incentives.', 'ペナルティとインセンティブを区別してください。', 89, 72.5, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-25 10:00:00+09', '2026-03-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446660010026', 'Genetic Research Update',
  'https://eigomaster-audio.s3.amazonaws.com/q026.mp3',
  'CRISPR gene editing technology has advanced significantly, enabling precise modifications in human cells. However, ethical concerns persist regarding germline editing and potential long-term effects remain unknown.',
  '["CRISPR technology is not yet viable", "No ethical concerns exist", "Germline editing is widely accepted", "Long-term effects require further study"]',
  3, 4, NULL, '["genetics", "research", "technology"]', 'Understand both benefits and ethical limitations.', '利点と倫理的制限の両方を理解します。', 76, 69.8, TRUE, '550e8400-e29b-41d4-a716-446655440003', '2025-10-26 10:00:00+09', '2026-03-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446660010027', 'Space Exploration Strategy',
  'https://eigomaster-audio.s3.amazonaws.com/q027.mp3',
  'The mission aims to establish a permanent lunar base within 8 years, requiring international cooperation and substantial investment. Challenges include developing life support systems for extended stays and ensuring crew safety in harsh environments.',
  '["The timeline is 15 years", "No international cooperation is required", "Life support is not a challenge", "A lunar base will be established"]',
  3, 4, NULL, '["space", "exploration", "mission"]', 'Identify the specific timeline and main challenges.', '具体的な時間線と主な課題を特定します。', 62, 65.3, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-27 10:00:00+09', '2026-03-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446660010028', 'Linguistic Theory Debate',
  'https://eigomaster-audio.s3.amazonaws.com/q028.mp3',
  'The universal grammar hypothesis, while influential, faces challenges from cross-linguistic research showing greater variation than predicted. Neurolinguistic evidence suggests language acquisition involves multiple neural systems, not a single language faculty.',
  '["Universal grammar explains all language variation", "Linguistic variation is minimal", "Multiple neural systems are involved", "Single language faculty is confirmed"]',
  2, 5, NULL, '["linguistics", "theory", "grammar"]', 'Compare theoretical predictions with empirical evidence.', '理論的予測と経験的証拠を比較してください。', 51, 58.7, TRUE, '550e8400-e29b-41d4-a716-446655440002', '2025-10-28 10:00:00+09', '2026-03-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446660010029', 'Economic Theory Discussion',
  'https://eigomaster-audio.s3.amazonaws.com/q029.mp3',
  'Behavioral economics reveals that humans often act irrationally, contradicting classical economic assumptions. Factors like cognitive biases, social preferences, and bounded rationality significantly influence decision-making.',
  '["Classical economics accurately predicts human behavior", "Cognitive biases do not affect decisions", "Humans always maximize utility rationally", "Social preferences influence economic choices"]',
  3, 5, NULL, '["economics", "behavior", "theory"]', 'Contrast classical and behavioral economics.', '古典経済学と行動経済学を対比してください。', 68, 62.1, TRUE, '550e8400-e29b-41d4-a716-446655440003', '2025-10-29 10:00:00+09', '2026-03-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446660010030', 'Climate Modeling Presentation',
  'https://eigomaster-audio.s3.amazonaws.com/q030.mp3',
  'Advanced climate models incorporate atmospheric dynamics, ocean circulation, and ice sheet behavior to predict future scenarios. Uncertainty remains regarding feedback mechanisms, but models consistently show warming under high emission scenarios.',
  '["Models cannot predict warming trends", "Ocean circulation is not considered", "Feedback mechanisms are fully understood", "Multiple processes are included in models"]',
  3, 5, NULL, '["climate', 'modeling", "science"]', 'Identify model components and remaining uncertainties.', 'モデルコンポーネントと残りの不確実性を特定します。', 45, 60.4, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-30 10:00:00+09', '2026-03-19 10:00:00+09');

-- =====================================================================
-- END: 30 Listening Questions across all difficulty levels
-- =====================================================================
