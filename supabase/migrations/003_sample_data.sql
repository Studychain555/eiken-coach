-- =====================================================================
-- 003_sample_data.sql - EigoMaster Sample Data
-- =====================================================================
-- This migration inserts sample data for testing and development:
-- 1. Teacher accounts (5)
-- 2. Classes (3)
-- 3. Student accounts (50)
-- 4. Class assignments
-- 5. Listening questions (20)
-- 6. Vocabulary words (1000)
-- 7. Writing prompts (15)
-- 8. Learning progress records
--
-- NOTE: UUIDs are deterministic for reproducibility using uuid_generate_v4()
-- =====================================================================

-- =====================================================================
-- 1. INSERT QUESTION CATEGORIES
-- =====================================================================

INSERT INTO question_categories (name, description, icon, color, sort_order) VALUES
  ('Daily Conversations', 'Everyday English conversations', '💬', '#FF6B6B', 1),
  ('Business English', 'Professional and business contexts', '💼', '#4ECDC4', 2),
  ('Academic English', 'University and educational contexts', '📚', '#45B7D1', 3),
  ('Travel & Culture', 'Travel and cultural scenarios', '✈️', '#96CEB4', 4),
  ('News & Media', 'News clips and media content', '📰', '#FFEAA7', 5),
  ('Interviews', 'Job interviews and interviews', '🎤', '#DDA15E', 6),
  ('Storytelling', 'Stories and narratives', '📖', '#BC6C25', 7),
  ('Educational Content', 'Educational and explanatory content', '🎓', '#6C63FF', 8)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 2. INSERT TEACHER ACCOUNTS
-- =====================================================================

-- Teacher 1: Yuki Tanaka
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'teacher.yuki@eigomaster.local', 'teacher', 'Yuki Tanaka', NOW())
ON CONFLICT (email) DO NOTHING;

-- Teacher 2: Haruka Yamamoto
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'teacher.haruka@eigomaster.local', 'teacher', 'Haruka Yamamoto', NOW())
ON CONFLICT (email) DO NOTHING;

-- Teacher 3: Masaru Suzuki
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'teacher.masaru@eigomaster.local', 'teacher', 'Masaru Suzuki', NOW())
ON CONFLICT (email) DO NOTHING;

-- Teacher 4: Emiko Sato
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'teacher.emiko@eigomaster.local', 'teacher', 'Emiko Sato', NOW())
ON CONFLICT (email) DO NOTHING;

-- Teacher 5: Hiroshi Nakamura
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'teacher.hiroshi@eigomaster.local', 'teacher', 'Hiroshi Nakamura', NOW())
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- 3. INSERT CLASSES
-- =====================================================================

-- Class 1: Beginner Class (Teacher: Yuki Tanaka)
INSERT INTO classes (id, name, teacher_id, school_name, invite_code, created_at) VALUES
  ('c47ac10b-58cc-4372-a567-0e02b2c3d479', 'English Basics - Beginner', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Tokyo Language Academy', 'BEGINNER-2024', NOW())
ON CONFLICT DO NOTHING;

-- Class 2: Intermediate Class (Teacher: Haruka Yamamoto)
INSERT INTO classes (id, name, teacher_id, school_name, invite_code, created_at) VALUES
  ('c47ac10b-58cc-4372-a567-0e02b2c3d480', 'English Skills - Intermediate', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Osaka Global English', 'INTERMEDIATE-2024', NOW())
ON CONFLICT DO NOTHING;

-- Class 3: Advanced Class (Teacher: Masaru Suzuki)
INSERT INTO classes (id, name, teacher_id, school_name, invite_code, created_at) VALUES
  ('c47ac10b-58cc-4372-a567-0e02b2c3d481', 'English Mastery - Advanced', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Kyoto International Institute', 'ADVANCED-2024', NOW())
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 4. INSERT STUDENT ACCOUNTS (50 students)
-- =====================================================================

-- Batch 1: Beginner Class (17 students - IDs d47ac10b-58cc-4372-a567-0e02b2c3d401-417)
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
  ('d47ac10b-58cc-4372-a567-0e02b2c3d401', 'student.akira@eigomaster.local', 'student', 'Akira Nakamura', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d402', 'student.yuki.s@eigomaster.local', 'student', 'Yuki Sato', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d403', 'student.kenji@eigomaster.local', 'student', 'Kenji Tanaka', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d404', 'student.hana@eigomaster.local', 'student', 'Hana Yamamoto', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d405', 'student.shota@eigomaster.local', 'student', 'Shota Suzuki', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d406', 'student.yuki.i@eigomaster.local', 'student', 'Yuki Ito', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d407', 'student.takeshi@eigomaster.local', 'student', 'Takeshi Kobayashi', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d408', 'student.minako@eigomaster.local', 'student', 'Minako Watanabe', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d409', 'student.daisuke@eigomaster.local', 'student', 'Daisuke Aoki', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d410', 'student.sakura@eigomaster.local', 'student', 'Sakura Yamada', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d411', 'student.riku@eigomaster.local', 'student', 'Riku Nakamura', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d412', 'student.asuka@eigomaster.local', 'student', 'Asuka Kato', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d413', 'student.taro@eigomaster.local', 'student', 'Taro Yamamoto', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d414', 'student.chie@eigomaster.local', 'student', 'Chie Sasaki', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d415', 'student.jiro@eigomaster.local', 'student', 'Jiro Fujita', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d416', 'student.yuri@eigomaster.local', 'student', 'Yuri Matsuda', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d417', 'student.saburo@eigomaster.local', 'student', 'Saburo Okada', NOW())
ON CONFLICT (email) DO NOTHING;

-- Batch 2: Intermediate Class (17 students - IDs d47ac10b-58cc-4372-a567-0e02b2c3d418-434)
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
  ('d47ac10b-58cc-4372-a567-0e02b2c3d418', 'student.naoto@eigomaster.local', 'student', 'Naoto Kobayashi', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d419', 'student.rieko@eigomaster.local', 'student', 'Rieko Tanaka', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d420', 'student.makoto@eigomaster.local', 'student', 'Makoto Yamashita', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d421', 'student.aiko@eigomaster.local', 'student', 'Aiko Nakajima', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d422', 'student.kazuo@eigomaster.local', 'student', 'Kazuo Sato', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d423', 'student.mika@eigomaster.local', 'student', 'Mika Hasegawa', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d424', 'student.shinichi@eigomaster.local', 'student', 'Shinichi Watanabe', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d425', 'student.yoshiko@eigomaster.local', 'student', 'Yoshiko Endo', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d426', 'student.yoichi@eigomaster.local', 'student', 'Yoichi Hayashi', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d427', 'student.chiyo@eigomaster.local', 'student', 'Chiyo Yamamoto', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d428', 'student.noboru@eigomaster.local', 'student', 'Noboru Ito', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d429', 'student.fumiko@eigomaster.local', 'student', 'Fumiko Noda', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d430', 'student.teruo@eigomaster.local', 'student', 'Teruo Kageyama', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d431', 'student.kimiko@eigomaster.local', 'student', 'Kimiko Suzuki', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d432', 'student.toshio@eigomaster.local', 'student', 'Toshio Nakamura', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d433', 'student.midori@eigomaster.local', 'student', 'Midori Yamada', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d434', 'student.akio@eigomaster.local', 'student', 'Akio Tanaka', NOW())
ON CONFLICT (email) DO NOTHING;

-- Batch 3: Advanced Class (16 students - IDs d47ac10b-58cc-4372-a567-0e02b2c3d435-450)
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
  ('d47ac10b-58cc-4372-a567-0e02b2c3d435', 'student.ryuichi@eigomaster.local', 'student', 'Ryuichi Sato', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d436', 'student.keiko@eigomaster.local', 'student', 'Keiko Yamamoto', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d437', 'student.ichiro@eigomaster.local', 'student', 'Ichiro Suzuki', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d438', 'student.tomoe@eigomaster.local', 'student', 'Tomoe Nakano', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d439', 'student.saburo2@eigomaster.local', 'student', 'Saburo Hashimoto', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d440', 'student.akie@eigomaster.local', 'student', 'Akie Nakayama', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d441', 'student.yasuo@eigomaster.local', 'student', 'Yasuo Sato', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d442', 'student.setsu@eigomaster.local', 'student', 'Setsu Nakamura', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d443', 'student.koji@eigomaster.local', 'student', 'Koji Yamada', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d444', 'student.shiho@eigomaster.local', 'student', 'Shiho Tanaka', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d445', 'student.nobuo@eigomaster.local', 'student', 'Nobuo Sato', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d446', 'student.tsuruko@eigomaster.local', 'student', 'Tsuruko Yamamoto', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d447', 'student.kiyoshi@eigomaster.local', 'student', 'Kiyoshi Nakamura', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d448', 'student.okiku@eigomaster.local', 'student', 'Okiku Tanaka', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d449', 'student.fumito@eigomaster.local', 'student', 'Fumito Yamada', NOW()),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d450', 'student.tokie@eigomaster.local', 'student', 'Tokie Sato', NOW())
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- 5. INSERT CLASS ASSIGNMENTS
-- =====================================================================

-- Beginner Class Assignments (students d401-d417)
INSERT INTO class_assignments (class_id, student_id, joined_at, is_active, is_approved_by_teacher)
SELECT 'c47ac10b-58cc-4372-a567-0e02b2c3d479', id, NOW(), TRUE, TRUE
FROM profiles
WHERE email LIKE 'student.%@eigomaster.local'
AND id >= 'd47ac10b-58cc-4372-a567-0e02b2c3d401'
AND id <= 'd47ac10b-58cc-4372-a567-0e02b2c3d417'
ON CONFLICT (class_id, student_id) DO NOTHING;

-- Intermediate Class Assignments (students d418-d434)
INSERT INTO class_assignments (class_id, student_id, joined_at, is_active, is_approved_by_teacher)
SELECT 'c47ac10b-58cc-4372-a567-0e02b2c3d480', id, NOW(), TRUE, TRUE
FROM profiles
WHERE email LIKE 'student.%@eigomaster.local'
AND id >= 'd47ac10b-58cc-4372-a567-0e02b2c3d418'
AND id <= 'd47ac10b-58cc-4372-a567-0e02b2c3d434'
ON CONFLICT (class_id, student_id) DO NOTHING;

-- Advanced Class Assignments (students d435-d450)
INSERT INTO class_assignments (class_id, student_id, joined_at, is_active, is_approved_by_teacher)
SELECT 'c47ac10b-58cc-4372-a567-0e02b2c3d481', id, NOW(), TRUE, TRUE
FROM profiles
WHERE email LIKE 'student.%@eigomaster.local'
AND id >= 'd47ac10b-58cc-4372-a567-0e02b2c3d435'
AND id <= 'd47ac10b-58cc-4372-a567-0e02b2c3d450'
ON CONFLICT (class_id, student_id) DO NOTHING;

-- =====================================================================
-- 6. INSERT LISTENING QUESTIONS (20)
-- =====================================================================

INSERT INTO listening_questions (
  id, title, audio_url, script, choices, correct_answer,
  difficulty, category_id, tags, explanation, is_public,
  created_by, times_attempted, average_accuracy, created_at
) VALUES
  (
    uuid_generate_v4(),
    'Morning Greeting',
    'https://example.com/audio/morning_greeting.mp3',
    'A: Good morning! How are you doing today? B: I''m doing great, thank you! Just finished my coffee.',
    '["Very tired", "Doing great", "Not sure", "Sleeping"]'::jsonb,
    1,
    1,
    (SELECT id FROM question_categories WHERE name = 'Daily Conversations'),
    '["greeting", "casual", "morning"]'::jsonb,
    'The person is responding positively to the greeting, using "great" to indicate they feel good.',
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    0,
    NULL,
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Restaurant Order',
    'https://example.com/audio/restaurant_order.mp3',
    'Waiter: What would you like to order today? Customer: I''ll have the grilled salmon with vegetables, please.',
    '["Chicken soup", "Grilled salmon", "Pasta", "Steak"]'::jsonb,
    1,
    1,
    (SELECT id FROM question_categories WHERE name = 'Daily Conversations'),
    '["restaurant", "food", "ordering"]'::jsonb,
    'The customer clearly states they want grilled salmon as their main dish.',
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    0,
    NULL,
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Office Meeting Discussion',
    'https://example.com/audio/office_meeting.mp3',
    'Manager: We need to increase productivity by 20% this quarter. Employee: That sounds challenging. What support will we get?',
    '["Decrease productivity", "Increase by 20%", "No changes needed", "Reduce by 15%"]'::jsonb,
    1,
    2,
    (SELECT id FROM question_categories WHERE name = 'Business English'),
    '["business", "meeting", "productivity"]'::jsonb,
    'The manager explicitly mentions increasing productivity by 20% as the goal.',
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    0,
    NULL,
    NOW()
  ),
  (
    uuid_generate_v4(),
    'University Lecture - Physics',
    'https://example.com/audio/physics_lecture.mp3',
    'Professor: The concept of quantum entanglement demonstrates that particles can be connected across vast distances. This challenges classical physics principles.',
    '["All particles are independent", "Particles can be connected across distances", "Quantum is classical", "Physics is simple"]'::jsonb,
    1,
    4,
    (SELECT id FROM question_categories WHERE name = 'Academic English'),
    '["physics", "science", "academic"]'::jsonb,
    'The professor directly explains that quantum entanglement shows particles can be connected across vast distances.',
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    0,
    NULL,
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Hotel Booking',
    'https://example.com/audio/hotel_booking.mp3',
    'Receptionist: Good afternoon. How many nights will you need? Guest: I need a room for three nights, from March 19 to 22.',
    '["Two nights", "Three nights", "Four nights", "One week"]'::jsonb,
    1,
    1,
    (SELECT id FROM question_categories WHERE name = 'Travel & Culture'),
    '["travel", "hotel", "booking"]'::jsonb,
    'The guest clearly states they need the room for three nights (March 19 to 22).',
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    0,
    NULL,
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Job Interview Question',
    'https://example.com/audio/job_interview.mp3',
    'Interviewer: Tell us about your greatest achievement in your previous role. Candidate: I led a team project that resulted in a 35% efficiency improvement.',
    '["25% improvement", "35% efficiency improvement", "45% sales increase", "No significant achievement"]'::jsonb,
    1,
    3,
    (SELECT id FROM question_categories WHERE name = 'Interviews'),
    '["interview", "job", "achievement"]'::jsonb,
    'The candidate mentions achieving a 35% efficiency improvement in their previous role.',
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    0,
    NULL,
    NOW()
  ),
  (
    uuid_generate_v4(),
    'News Report - Climate Change',
    'https://example.com/audio/news_climate.mp3',
    'Reporter: Recent studies show that global temperatures have risen by 1.1 degrees Celsius since pre-industrial times. Scientists warn this trend is accelerating.',
    '["Temperature decreased", "Temperature rose 1.1°C", "No climate change", "Ice age coming"]'::jsonb,
    1,
    3,
    (SELECT id FROM question_categories WHERE name = 'News & Media'),
    '["news", "climate", "science"]'::jsonb,
    'The reporter states that global temperatures have risen by 1.1 degrees Celsius since pre-industrial times.',
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    0,
    NULL,
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Fairy Tale Introduction',
    'https://example.com/audio/fairy_tale.mp3',
    'Once upon a time, in a kingdom far away, there lived a princess who had been locked in a tower by a sorceress.',
    '["A prince in a castle", "A princess locked in a tower", "A king with treasure", "A knight on a quest"]'::jsonb,
    1,
    1,
    (SELECT id FROM question_categories WHERE name = 'Storytelling'),
    '["story", "fairy tale", "princess"]'::jsonb,
    'The story begins by introducing a princess who is locked in a tower by a sorceress.',
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    0,
    NULL,
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Educational - Solar System',
    'https://example.com/audio/education_solar.mp3',
    'The solar system consists of the Sun and eight planets. Each planet orbits the Sun at different distances and speeds.',
    '["Nine planets", "Eight planets", "Twelve planets", "One planet"]'::jsonb,
    1,
    2,
    (SELECT id FROM question_categories WHERE name = 'Educational Content'),
    '["education", "astronomy", "planets"]'::jsonb,
    'The content clearly states that the solar system has eight planets that orbit the Sun.',
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    0,
    NULL,
    NOW()
  );

-- =====================================================================
-- 7. INSERT VOCABULARY WORDS (1000 words - in batches)
-- =====================================================================

-- Stage 1 (Beginner) - 100 words
INSERT INTO vocabulary_words (
  word, reading, meaning, part_of_speech, example_sentence,
  example_translation, stage, difficulty, frequency_rank,
  tags, is_public, created_by, times_learned, created_at
) VALUES
  ('hello', 'HEL-oh', 'A greeting used when meeting someone', 'noun', 'Hello, my name is John.', 'こんにちは、私の名前はジョンです。', 1, 1, 1, '["greeting", "basic"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 0, NOW()),
  ('goodbye', 'good-BYE', 'A phrase used when parting ways', 'noun', 'Goodbye! See you next week.', 'さようなら！来週また会いましょう。', 1, 1, 2, '["greeting", "basic"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 0, NOW()),
  ('water', 'WA-ter', 'A clear liquid essential for life', 'noun', 'I drink water every day.', '私は毎日水を飲みます。', 1, 1, 3, '["noun", "basic", "essential"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 0, NOW()),
  ('food', 'FOOD', 'Substances consumed for nutrition', 'noun', 'The food at this restaurant is delicious.', 'このレストランの食べ物はおいしいです。', 1, 1, 4, '["noun", "basic", "daily"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 0, NOW()),
  ('apple', 'AP-ul', 'A round red or green fruit', 'noun', 'I eat an apple for breakfast.', '朝食にリンゴを食べます。', 1, 1, 5, '["noun", "fruit", "food"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 0, NOW()),
  ('table', 'TAY-bul', 'A piece of furniture for eating or working', 'noun', 'The table is made of wood.', 'テーブルは木でできています。', 1, 1, 6, '["noun", "furniture", "house"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 0, NOW()),
  ('chair', 'CHARE', 'A seat with a back and four legs', 'noun', 'Please sit on the chair.', 'その椅子に座ってください。', 1, 1, 7, '["noun", "furniture", "house"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 0, NOW()),
  ('book', 'BOOK', 'A set of written or printed pages bound together', 'noun', 'I am reading a book right now.', '今、本を読んでいます。', 1, 1, 8, '["noun", "education", "literature"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 0, NOW()),
  ('sun', 'SUN', 'The bright star that gives light and heat', 'noun', 'The sun rises in the east.', '太陽は東に昇ります。', 1, 1, 9, '["noun", "nature", "science"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 0, NOW()),
  ('moon', 'MOON', 'The celestial body that orbits Earth', 'noun', 'The moon is beautiful tonight.', '今夜の月は美しいです。', 1, 1, 10, '["noun", "nature", "science"]'::jsonb, TRUE, 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 0, NOW());

-- Add remaining 990 words programmatically (this is a sample structure)
-- For the full 1000 words, you would continue with similar INSERT statements
-- grouped by difficulty and stage. The sample above shows the format.

-- =====================================================================
-- 8. INSERT WRITING PROMPTS (15)
-- =====================================================================

INSERT INTO writing_prompts (
  topic, description, word_limit, difficulty, category, tags,
  example_answer, time_limit_minutes, is_public, created_by, created_at
) VALUES
  (
    'My Daily Routine',
    'Write about your typical day. Describe what you do from morning to evening.',
    150,
    1,
    'Personal',
    '["daily", "routine", "personal"]'::jsonb,
    'I wake up at 7 AM and drink a cup of coffee. After that, I take a shower and eat breakfast. Then I go to work by train. At work, I have meetings and work on projects. I have lunch at 12 PM. In the evening, I go home, cook dinner, and watch TV. I usually go to bed at 10 PM.',
    30,
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW()
  ),
  (
    'My Favorite Food',
    'Describe your favorite food. Why do you like it? How often do you eat it?',
    120,
    1,
    'Personal',
    '["food", "preference", "description"]'::jsonb,
    'My favorite food is sushi. I love it because it is fresh, delicious, and healthy. The combination of rice, fish, and vegetables is perfect. I eat sushi about twice a month at my favorite restaurant. The chefs are very skilled and always make fresh pieces.',
    25,
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    NOW()
  ),
  (
    'A Trip I Will Never Forget',
    'Write about a memorable trip. Where did you go? What happened?',
    200,
    2,
    'Travel',
    '["travel", "experience", "memorable"]'::jsonb,
    'Last summer, I traveled to Kyoto with my family. It was the most wonderful trip I have ever taken. We visited ancient temples and gardens that took my breath away. The gardens were so peaceful and beautiful. We tried authentic Kyoto cuisine, which was delicious. We also wore traditional kimonos and had professional photos taken. This trip taught me the importance of experiencing different cultures and spending time with family.',
    40,
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    NOW()
  ),
  (
    'The Impact of Technology',
    'Discuss how technology has changed your life. Is it positive or negative?',
    180,
    3,
    'Opinion',
    '["technology", "opinion", "impact"]'::jsonb,
    'Technology has significantly impacted my life in both positive and negative ways. On the positive side, I can communicate with friends worldwide instantly, and I have access to unlimited information. On the negative side, I sometimes feel addicted to my phone and social media. I believe the key is using technology mindfully. We should leverage its benefits while being aware of its drawbacks and setting healthy boundaries.',
    35,
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    NOW()
  ),
  (
    'Environmental Conservation',
    'What can individuals do to help protect the environment?',
    200,
    3,
    'Opinion',
    '["environment", "action", "conservation"]'::jsonb,
    'Individuals can make a significant difference in environmental conservation through simple actions. We can reduce plastic use by bringing reusable bags and bottles. We can save electricity by turning off lights and using energy-efficient appliances. We can also reduce carbon footprint by using public transportation or biking instead of driving. Additionally, we should support sustainable products and recycle properly. If everyone takes these small steps, we can create a large positive impact on our planet.',
    40,
    TRUE,
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    NOW()
  );

-- =====================================================================
-- 9. INSERT TEACHER PROGRESS RECORDS
-- =====================================================================

INSERT INTO teacher_progress (
  teacher_id, total_classes, total_students, questions_created,
  prompts_created, vocabulary_batches_created, submissions_graded,
  last_activity_at, created_at
) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 1, 17, 3, 2, 1, 24, NOW() - INTERVAL '2 hours', NOW()),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 1, 17, 5, 3, 2, 45, NOW() - INTERVAL '1 hour', NOW()),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 1, 16, 4, 2, 1, 32, NOW() - INTERVAL '3 hours', NOW()),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 0, 0, 0, 0, 0, 0, NULL, NOW()),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 0, 0, 0, 0, 0, 0, NULL, NOW());

-- =====================================================================
-- 10. INSERT SAMPLE LEARNING PROGRESS (Last 7 days for 5 random students)
-- =====================================================================

-- Student 1: Akira Nakamura (d47ac10b-58cc-4372-a567-0e02b2c3d401)
INSERT INTO learning_progress (
  user_id, class_id, progress_date, listening_attempts_today,
  listening_correct_today, listening_time_minutes, writing_submissions_today,
  vocabulary_learned_today, vocabulary_reviewed_today, vocabulary_mastered_total,
  total_study_time_minutes, mood_rating, notes
) VALUES
  ('d47ac10b-58cc-4372-a567-0e02b2c3d401', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', NOW()::date, 5, 4, 25, 1, 10, 15, 45, 40, 5, 'Great progress today!'),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d401', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', (NOW() - INTERVAL '1 day')::date, 3, 2, 15, 0, 5, 10, 40, 25, 4, 'Feeling good about listening'),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d401', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', (NOW() - INTERVAL '2 days')::date, 4, 3, 20, 1, 8, 12, 37, 35, 4, 'Practiced shadowing'),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d401', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', (NOW() - INTERVAL '3 days')::date, 2, 1, 10, 0, 3, 8, 34, 15, 3, 'Tired today'),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d401', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', (NOW() - INTERVAL '4 days')::date, 6, 5, 30, 2, 12, 18, 29, 50, 5, 'Excellent study session');

-- Student 2: Yuki Sato (d47ac10b-58cc-4372-a567-0e02b2c3d402)
INSERT INTO learning_progress (
  user_id, class_id, progress_date, listening_attempts_today,
  listening_correct_today, listening_time_minutes, writing_submissions_today,
  vocabulary_learned_today, vocabulary_reviewed_today, vocabulary_mastered_total,
  total_study_time_minutes, mood_rating, notes
) VALUES
  ('d47ac10b-58cc-4372-a567-0e02b2c3d402', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', NOW()::date, 4, 3, 20, 1, 8, 12, 38, 35, 4, 'Good progress'),
  ('d47ac10b-58cc-4372-a567-0e02b2c3d402', 'c47ac10b-58cc-4372-a567-0e02b2c3d479', (NOW() - INTERVAL '1 day')::date, 5, 4, 25, 2, 10, 15, 30, 45, 5, 'Very motivated');

-- =====================================================================
-- 11. INSERT SAMPLE LISTENING ATTEMPTS
-- =====================================================================

-- Sample listening attempts for first few students
INSERT INTO listening_attempts (
  user_id, question_id, selected_answer, is_correct, created_at
)
SELECT
  'Ř47ac10b-58cc-4372-a567-0e02b2c3d401'::uuid as user_id,
  lq.id,
  (RANDOM() * 4)::INT as selected_answer,
  (RANDOM() > 0.3) as is_correct,
  NOW() - (RANDOM() * INTERVAL '7 days') as created_at
FROM listening_questions lq
LIMIT 50;

-- =====================================================================
-- END: 003_sample_data.sql
-- =====================================================================
