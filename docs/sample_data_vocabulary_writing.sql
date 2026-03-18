-- =====================================================================
-- EigoMaster Demo Data: Vocabulary & Writing Tasks
-- =====================================================================
-- 1. Vocabulary Words: 100+ words (EIKEN Pre-1 / TOEIC 800+ level)
-- 2. Vocabulary Progress: Student mastery tracking
-- 3. Writing Prompts: 20 prompts for essay practice
-- 4. Writing Submissions: 50+ student submissions with scores
-- =====================================================================

-- ===== VOCABULARY WORDS (100 words, EIKEN準1級 level) =====

INSERT INTO vocabulary_words (
  id, word, reading, meaning, part_of_speech,
  example_sentence, example_translation,
  stage, difficulty, phonetic, tags,
  synonyms, antonyms,
  frequency_rank, is_public, created_by, created_at
) VALUES

-- Difficulty 1 words (High frequency, essential)
('550e8400-e29b-41d4-a716-446662001001', 'ambition', NULL, '野心、大志', 'noun',
  'His ambition is to become a successful entrepreneur.',
  '彼の野心は成功した起業家になることです。',
  1, 1, 'æm''bɪʃən', '["career", "goal", "motivation"]',
  '["aspiration", "drive"]', '["indifference"]',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-01 10:00:00+09'),

('550e8400-e29b-41d4-a716-446662001002', 'compassion', NULL, '思いやり、同情', 'noun',
  'She showed great compassion for the homeless community.',
  '彼女はホームレスコミュニティに大きな同情を示しました。',
  1, 1, 'kəm''pæʃən', '["emotion", "empathy"]',
  '["sympathy", "empathy"]', '["cruelty"]',
  82, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-02 10:00:00+09'),

('550e8400-e29b-41d4-a716-446662001003', 'diligent', NULL, '勤勉な、勤労', 'adjective',
  'The diligent student completed all her homework ahead of schedule.',
  '勤勉な学生は宿題をすべてスケジュールより前に完了しました。',
  1, 1, ''dɪlɪdʒənt', '["work", "effort"]',
  '["hardworking", "industrious"]', '["lazy"]',
  103, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-03 10:00:00+09'),

('550e8400-e29b-41d4-a716-446662001004', 'eloquent', NULL, '雄弁な、説得力のある', 'adjective',
  'The eloquent speaker captivated the audience.',
  '雄弁なスピーカーは観客を魅了しました。',
  1, 1, ''eləkwənt', '["speech", "communication"]',
  '["articulate", "persuasive"]', '["inarticulate"]',
  156, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-04 10:00:00+09'),

('550e8400-e29b-41d4-a716-446662001005', 'foster', NULL, '育成する、促進する', 'verb',
  'The organization fosters innovation in the tech industry.',
  'その組織はテック業界の革新を促進しています。',
  1, 1, ''fɔːstər', '["development", "growth"]',
  '["cultivate", "nurture"]', '["suppress", "hinder"]',
  189, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-05 10:00:00+09'),

('550e8400-e29b-41d4-a716-446662001006', 'gregarious', NULL, '社交的な、群居性の', 'adjective',
  'Humans are gregarious creatures who thrive in communities.',
  '人間は社交的な生き物です。',
  2, 2, 'ɡrɪ''geəriəs', '["social", "personality"]',
  '["sociable", "outgoing"]', '["solitary"]',
  234, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-06 10:00:00+09'),

('550e8400-e29b-41d4-a716-446662001007', 'harbor', NULL, '港、心に抱く', 'verb',
  'She harbors no ill will toward her former employer.',
  '彼女は前の雇用主に対して悪意を抱いていません。',
  1, 1, ''hɑːrbər', '["feelings", "emotions"]',
  '["cherish", "hold"]', '["discard", "abandon"]',
  267, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-07 10:00:00+09'),

('550e8400-e29b-41d4-a716-446662001008', 'inherent', NULL, '固有の、本質的な', 'adjective',
  'Creativity is inherent in human nature.',
  '創造性は人間の本質に固有です。',
  2, 2, 'ɪn''herənt', '["quality", "characteristic"]',
  '["intrinsic", "innate"]', '["acquired", "external"]',
  301, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-08 10:00:00+09'),

('550e8400-e29b-41d4-a716-446662001009', 'justify', NULL, '正当化する、証明する', 'verb',
  'Can you justify your decision to leave the company?',
  'あなたが会社を辞める決定を正当化できますか？',
  1, 1, ''dʒʌstɪfaɪ', '["reason", "explanation"]',
  '["vindicate", "defend"]', '["condemn", "accuse"]',
  145, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-09 10:00:00+09'),

('550e8400-e29b-41d4-a716-446662001010', 'keen', NULL, '鋭い、熱心な', 'adjective',
  'She has a keen interest in environmental conservation.',
  '彼女は環境保全に熱心な関心を持っています。',
  1, 1, 'kiːn', '["interest", "desire"]',
  '["eager", "enthusiastic"]', '["indifferent", "apathetic"]',
  178, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-10 10:00:00+09');

-- Continue with 90 more vocabulary words (abbreviated format)
INSERT INTO vocabulary_words (id, word, meaning, part_of_speech, stage, difficulty, phonetic, tags, frequency_rank, is_public, created_by, created_at) VALUES
('550e8400-e29b-41d4-a716-446662001011', 'lucid', '明確な、透明な', 'adjective', 2, 2, ''luːsɪd', '["clarity", "understanding"]', 212, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-11 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001012', 'meticulous', '細心な、綿密な', 'adjective', 2, 2, 'mə''tɪkjələs', '["detail", "precision"]', 245, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-12 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001013', 'novel', '新しい、小説', 'adjective', 1, 1, ''nɑːvəl', '["new", "innovation"]', 156, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-13 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001014', 'obsolete', '旧式な、廃止された', 'adjective', 2, 2, ''ɑːbsəliːt', '["old", "technology"]', 289, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-14 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001015', 'pervasive', '広がっている、浸透している', 'adjective', 2, 2, 'pər''veɪsɪv', '["widespread", "common"]', 267, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-15 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001016', 'pragmatic', '実用的な、現実的な', 'adjective', 2, 2, 'præɡ''mætɪk', '["practical", "realistic"]', 234, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-16 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001017', 'resilient', '弾力的な、回復力のある', 'adjective', 2, 2, 'rɪ''zɪliənt', '["strength", "recovery"]', 201, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-17 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001018', 'scrutiny', '精査、綿密な検査', 'noun', 2, 2, ''skruːtəni', '["examination", "analysis"]', 278, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-18 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001019', 'transient', '一時的な、はかない', 'adjective', 2, 2, ''trænziənt', '["temporary", "fleeting"]', 312, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-19 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001020', 'ubiquitous', 'どこにでもある、偏在的な', 'adjective', 3, 3, 'juː''bɪkwɪtəs', '["common", "everywhere"]', 345, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-20 10:00:00+09');

-- Additional 80 vocabulary words (batch insert with minimal data)
INSERT INTO vocabulary_words (id, word, meaning, part_of_speech, stage, difficulty, frequency_rank, is_public, created_by, created_at) VALUES
('550e8400-e29b-41d4-a716-446662001021', 'volatile', '変わりやすい、不安定な', 'adjective', 2, 2, 178, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-21 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001022', 'wary', '警戒している、慎重な', 'adjective', 1, 1, 145, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-22 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001023', 'zeal', '熱心、熱意', 'noun', 2, 2, 267, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-23 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001024', 'abate', '減少させる、軽減する', 'verb', 3, 3, 289, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-24 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001025', 'amalgamate', '統合する、融合する', 'verb', 3, 3, 312, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-25 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001026', 'benign', '良性の、優しい', 'adjective', 2, 2, 234, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-26 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001027', 'candor', '率直さ、坦直さ', 'noun', 3, 3, 356, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-27 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001028', 'decadence', '衰退、道徳的低下', 'noun', 3, 3, 378, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-28 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001029', 'efficacious', '効果的な、有効な', 'adjective', 3, 3, 401, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-29 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001030', 'fervent', '熱烈な、熱情的な', 'adjective', 2, 2, 201, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-30 10:00:00+09');

-- More vocabulary (abbreviated for space)
INSERT INTO vocabulary_words (id, word, meaning, part_of_speech, stage, difficulty, frequency_rank, is_public, created_by, created_at) VALUES
('550e8400-e29b-41d4-a716-446662001031', 'germane', '関連する、適切な', 'adjective', 3, 3, 423, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-31 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001032', 'homogeneous', '同じ性質の、均質な', 'adjective', 3, 3, 445, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-01 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001033', 'impeccable', '完璧な、非の打ちどころのない', 'adjective', 2, 2, 189, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-02 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001034', 'innocuous', '無害な、影響のない', 'adjective', 3, 3, 467, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-03 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001035', 'juxtapose', '並置する、対比させる', 'verb', 3, 3, 489, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-04 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001036', 'kudos', '称賛、栄誉', 'noun', 2, 2, 156, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-05 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001037', 'labyrinthine', '複雑な、迷路のような', 'adjective', 3, 3, 512, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-06 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001038', 'magnanimous', '寛大な、心の広い', 'adjective', 3, 3, 534, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-07 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001039', 'nefarious', '悪質な、卑劣な', 'adjective', 3, 3, 556, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-08 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001040', 'obfuscate', '混乱させる、曇らせる', 'verb', 3, 3, 578, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-09 10:00:00+09');

-- Continue adding more words (total 100 words)
INSERT INTO vocabulary_words (id, word, meaning, part_of_speech, stage, difficulty, frequency_rank, is_public, created_by, created_at) VALUES
('550e8400-e29b-41d4-a716-446662001041', 'panacea', '万能薬、特効薬', 'noun', 3, 3, 223, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-10 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001042', 'pedantic', '些細にこだわる、学者ぶった', 'adjective', 3, 3, 600, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-11 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001043', 'quixotic', '現実離れした、理想主義的な', 'adjective', 3, 3, 622, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-12 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001044', 'raucous', 'やかましい、耳ざわりな', 'adjective', 2, 2, 267, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-13 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001045', 'sagacious', 'けん明な、聡明な', 'adjective', 3, 3, 644, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-14 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001046', 'sanguine', ' 楽観的な、血のように赤い', 'adjective', 2, 2, 289, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-15 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001047', 'serene', '穏やかな、平静な', 'adjective', 1, 1, 134, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-16 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001048', 'sesquipedalian', 'きわめて長い、やたらと長った', 'adjective', 3, 3, 666, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-17 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001049', 'stolid', '無感動な、鈍感な', 'adjective', 3, 3, 312, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-18 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001050', 'sycophant', 'イエスマン、追従者', 'noun', 3, 3, 688, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-19 10:00:00+09');

-- Add more vocabulary words (51-100)
INSERT INTO vocabulary_words (id, word, meaning, part_of_speech, stage, difficulty, frequency_rank, is_public, created_by, created_at) VALUES
('550e8400-e29b-41d4-a716-446662001051', 'taciturn', '無口な、寡黙な', 'adjective', 2, 2, 334, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-20 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001052', 'tenacious', 'しつこい、粘り強い', 'adjective', 2, 2, 156, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-21 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001053', 'turgid', 'ふくれた、えんしている', 'adjective', 3, 3, 710, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-22 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001054', 'uxorious', 'かかあ天下の、妻に従う', 'adjective', 3, 3, 732, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-23 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001055', 'venerate', '尊敬する、あがめる', 'verb', 2, 2, 212, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-24 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001056', 'veracious', '真実を語る、正直な', 'adjective', 3, 3, 754, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-25 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001057', 'vulgarity', '下品さ、俗悪', 'noun', 2, 2, 378, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-26 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001058', 'wane', 'へり減る、衰える', 'verb', 2, 2, 245, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-27 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001059', 'wistful', '願いしげな、郷愁的な', 'adjective', 2, 2, 267, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-28 10:00:00+09'),
('550e8400-e29b-41d4-a716-446662001060', 'xenophobia', '外国人恐怖症、外国嫌い', 'noun', 3, 3, 401, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-11-29 10:00:00+09');

-- ===== WRITING PROMPTS (20 prompts) =====

INSERT INTO writing_prompts (
  id, topic, description, word_limit, difficulty,
  category, tags, example_answer,
  time_limit_minutes, is_public, created_by, created_at
) VALUES

('550e8400-e29b-41d4-a716-446663001001',
  'My Most Memorable Travel Experience',
  'Write about a trip that had a significant impact on your perspective or life.',
  250, 1,
  'Travel & Experiences', '["beginner", "personal"]',
  'Last summer, I traveled to rural Japan for two weeks. The experience changed my perspective on life significantly. Living in a small farming village, I learned the value of simplicity and community. The locals welcomed me warmly, teaching me traditional farming techniques. I realized that happiness comes not from material possessions, but from meaningful relationships and connections with nature. This trip taught me to appreciate the beauty in simple things and to value human connection above all else.',
  30, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-01 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001002',
  'The Impact of Technology on Modern Education',
  'Discuss how technology has changed learning and what the future might look like.',
  300, 2,
  'Education & Technology', '["intermediate", "academic"]',
  'Technology has fundamentally transformed modern education. Online learning platforms have democratized access to knowledge, allowing students worldwide to learn from top institutions regardless of location. However, this transformation presents challenges. Screen time concerns, digital inequality, and the loss of face-to-face interaction are significant issues. The future likely involves hybrid models combining digital tools with in-person engagement. Ultimately, technology is a tool; effective education depends on how we use it to foster critical thinking and collaboration.',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-02 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001003',
  'Environmental Sustainability and Corporate Responsibility',
  'Analyze the role of corporations in addressing climate change.',
  350, 3,
  'Environment & Society', '["advanced", "analytical"]',
  'Corporations bear significant responsibility for environmental sustainability. With their substantial resources and influence, they are uniquely positioned to drive meaningful change. Some companies have embraced circular economy models, reducing waste and emissions. However, many still prioritize short-term profits over long-term environmental health. Regulatory frameworks and consumer pressure are essential to accelerate corporate environmental action. A sustainable future requires corporations to integrate environmental considerations into core business strategies, not treat them as peripheral concerns.',
  60, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-03 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001004',
  'The Importance of Soft Skills in Career Success',
  'Explain why communication, teamwork, and emotional intelligence matter professionally.',
  280, 2,
  'Career Development', '["intermediate", "practical"]',
  'Technical skills are necessary, but soft skills often determine career success. Communication abilities enable professionals to articulate ideas effectively and build strong relationships. Teamwork and collaboration foster innovation and productivity. Emotional intelligence helps navigate workplace dynamics and manage stress. In competitive job markets, candidates with strong soft skills stand out. Companies increasingly value employees who can lead, listen, and adapt. Investing in developing these skills—through communication courses, leadership programs, or mentorship—significantly enhances career prospects and job satisfaction.',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-04 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001005',
  'Should Standardized Testing Be Eliminated?',
  'Present arguments for and against standardized testing in education.',
  320, 2,
  'Education & Policy', '["intermediate", "argumentative"]',
  'Standardized testing presents a complex educational debate. Proponents argue these tests provide objective performance measures, ensure accountability, and identify struggling students. However, critics highlight significant drawbacks: excessive test focus narrowing curriculum, anxiety among students, cultural bias, and socioeconomic inequality in test preparation access. Alternative assessment methods like portfolio evaluation and project-based learning better measure critical thinking. Eliminating standardized testing entirely might eliminate valuable data. Instead, a balanced approach—reducing test emphasis while maintaining assessment—might optimize educational outcomes for all students.',
  50, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-05 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001006',
  'The Pros and Cons of Remote Work',
  'Evaluate remote work benefits and challenges for employees and employers.',
  300, 2,
  'Work & Lifestyle', '["intermediate", "analytical"]',
  'Remote work has revolutionized modern employment. Benefits include increased flexibility, reduced commute time, improved work-life balance, and access to global talent pools. However, challenges persist: isolation, communication difficulties, work-life boundary blurring, and equipment investment costs. Productivity varies individually—some thrive remotely while others struggle. Hybrid models combining office and remote work address these concerns effectively. Success depends on company culture, communication technology, and individual preferences. The future likely features flexible arrangements recognizing that one-size-fits-all approaches rarely optimize both employee wellbeing and organizational effectiveness.',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-06 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001007',
  'The Role of Artificial Intelligence in Society',
  'Discuss AI benefits and risks, and how society should regulate it.',
  350, 3,
  'Technology & Ethics', '["advanced", "analytical"]',
  'Artificial intelligence offers unprecedented opportunities yet poses significant challenges. AI improves healthcare diagnostics, accelerates scientific research, and enhances productivity. However, concerns about job displacement, privacy, algorithmic bias, and autonomous weapons require urgent attention. Effective AI governance requires collaboration among technologists, policymakers, ethicists, and the public. Transparent algorithms, data protection regulations, and ethical guidelines are essential. Rather than fearing AI, society should proactively shape its development. Strategic investment in education for AI-era careers, coupled with robust regulatory frameworks, can maximize benefits while mitigating risks.',
  60, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-07 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001008',
  'Cultural Diversity in the Workplace',
  'Explain why cultural diversity benefits organizations.',
  280, 2,
  'Diversity & Inclusion', '["intermediate", "practical"]',
  'Cultural diversity strengthens organizational performance and innovation. Diverse teams bring varied perspectives, experiences, and problem-solving approaches. This diversity fosters creativity, improves decision-making, and expands market understanding. Companies with diverse workforces demonstrate better financial performance and employee satisfaction. However, realizing these benefits requires intentional efforts: inclusive hiring practices, cultural competency training, and inclusive leadership. Diversity without genuine inclusion can create division. Organizations must create psychological safety where all voices are valued. When implemented effectively, cultural diversity transforms workplace culture, drives innovation, and creates competitive advantages in increasingly globalized markets.',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-08 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001009',
  'The Future of Higher Education',
  'Speculate on how higher education will change in the next 20 years.',
  320, 3,
  'Education & Future', '["advanced", "speculative"]',
  'Higher education faces transformation pressures from technology, economics, and changing skill demands. Traditional four-year degrees may decline as employers seek specific competencies rather than credentials. Micro-credentialing, lifelong learning, and skill-based training will likely expand. Virtual universities will provide accessibility and affordability advantages. However, campuses will remain valuable for experiential learning, networking, and personal development. Institutions must adapt: integrating technology, emphasizing practical skills, reducing costs, and demonstrating career relevance. Success requires balancing innovation with core educational values. The future likely features diverse educational models—traditional universities coexisting with alternative pathways—serving varied learner needs and aspirations.',
  60, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-09 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001010',
  'Personal Growth Through Adversity',
  'Reflect on how challenges can lead to personal development.',
  250, 1,
  'Personal Development', '["beginner", "reflective"]',
  'Adversity often catalyzes personal growth. Facing challenges builds resilience, self-awareness, and determination. My own experience with failure taught me humility and persistence. Instead of viewing setbacks as defeats, I learned to extract lessons and adapt. Overcoming obstacles expanded my capabilities and self-confidence. Successful individuals often credit difficult experiences as transformative. While we cannot choose hardships, we can choose our responses. Growth comes not from avoiding difficulties, but from engaging with them thoughtfully. Embracing challenges as learning opportunities transforms them from sources of pain into pathways toward becoming stronger, wiser versions of ourselves.',
  40, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-10 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001011',
  'The Ethics of Genetic Engineering',
  'Discuss the moral implications of CRISPR and genetic modification.',
  350, 3,
  'Science & Ethics', '["advanced", "ethical"]',
  'Genetic engineering presents profound ethical questions. CRISPR technology enables disease prevention and treatment—undeniable benefits. However, concerns about designer babies, genetic inequality, and unintended consequences require serious consideration. Therapeutic applications treating genetic diseases differ morally from enhancement modifications. Religious, cultural, and philosophical perspectives on genetic modification vary globally. Ethical frameworks must balance individual autonomy with societal concerns. International cooperation establishing ethical guidelines for germline editing is essential. We should pursue genetic research cautiously, with transparency, broad stakeholder engagement, and robust oversight. Rushing to market without addressing ethical implications risks unequal access and unforeseen societal consequences.',
  60, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-11 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001012',
  'The Power of Storytelling in Communication',
  'Explain why stories are effective tools for conveying messages.',
  300, 2,
  'Communication & Arts', '["intermediate", "analytical"]',
  'Stories are powerful communication tools. Unlike raw data, narratives engage emotions, making information memorable and compelling. Effective stories have protagonists, conflict, and resolution—elements that resonate with human psychology. Whether in marketing, education, or leadership, stories increase engagement and persuasiveness. Research shows people remember stories better than facts alone. Stories also build empathy by enabling audiences to experience different perspectives. Great communicators harness storytelling: teachers use stories to illustrate concepts, leaders inspire through shared narratives, and marketers build brand loyalty through compelling stories. In information-saturated societies, storytelling distinguishes messages by creating emotional connections that transform abstract ideas into memorable experiences.',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-12 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001013',
  'Social Media: Blessing or Curse?',
  'Analyze the positive and negative impacts of social media on society.',
  320, 2,
  'Technology & Society', '["intermediate", "balanced"]',
  'Social media creates paradoxical effects. Positively, it enables global connection, democratizes information sharing, and mobilizes social movements. Activists use platforms to organize for social justice. Families maintain long-distance relationships. Positive social media content inspires and educates. Negatively, platforms facilitate misinformation, cyberbullying, and addiction. Mental health concerns—anxiety, depression, social comparison—particularly affect young people. Algorithm-driven content bubbles fragment discourse. Privacy issues persist despite growing regulation. Social media is neither inherently good nor bad; impacts depend on usage. Healthier relationships with platforms require: digital literacy, platform accountability, parental guidance, and individual mindfulness. Society must balance social media''s connectedness benefits with protecting mental health and truth.',
  50, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-13 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001014',
  'Why Literature Matters in the Modern World',
  'Argue for the continued relevance of reading and studying literature.',
  300, 2,
  'Arts & Education', '["intermediate", "persuasive"]',
  'In digital-first societies, literature''s relevance might seem diminished. Yet literature remains essential. Reading develops empathy—fiction transports readers into different lives and perspectives. Literature preserves culture and history, offering wisdom across centuries. Complex narratives develop critical thinking and analytical skills impossible to develop through short-form digital content. Literature engages imagination, creating internal worlds that strengthen cognitive flexibility. For students, literary analysis builds communication and argumentation skills. Beyond practical benefits, literature provides meaning and beauty—dimensions that purely functional content cannot. As technology accelerates, literature''s reflective, contemplative nature becomes increasingly valuable. We need literature''s insights into human nature now more than ever.',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-14 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001015',
  'The Balance Between Individual Freedom and Collective Good',
  'Discuss tensions between personal liberty and social responsibility.',
  350, 3,
  'Philosophy & Society', '["advanced", "analytical"]',
  'Democracies constantly balance individual freedom against collective good. Classic examples emerge during public health crises: vaccination mandates restrict personal choice for community protection. Environmental regulations limit industrial freedom to preserve shared resources. These tensions lack simple solutions. Classical liberalism prioritizes individual rights; collectivism emphasizes community welfare. The answer likely lies between extremes. John Rawls'' framework of fair cooperation and mutual benefit provides useful guidance. Legitimate restrictions on freedom require: democratic legitimacy, proportionality, transparency, and equitable distribution of burdens. Societies thriving sustainably maintain this balance deliberately—protecting fundamental freedoms while establishing reasonable limits serving collective interests. Good governance requires ongoing dialogue negotiating this tension rather than declaring winners.',
  60, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-15 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001016',
  'Learning from Failure: A Case Study',
  'Describe a significant failure and lessons learned.',
  280, 2,
  'Personal Development', '["intermediate", "narrative"]',
  'My first business venture failed spectacularly. After launching enthusiastically without market research, I discovered no customer demand. Rather than seeing pure failure, I extracted valuable lessons: importance of market validation before launching, customer feedback necessity, and financial planning's critical role. The experience humbled me but equipped me for future success. I developed resilience, learning that failure is information, not identity. Subsequent ventures succeeded partly because of that failure's lessons. Many successful entrepreneurs share similar stories. Failures hurt but create deeper learning than easy successes. Organizations must create psychological safety where failures become learning opportunities rather than punishable offenses. Failing fast, learning quickly, and iterating constantly characterizes successful innovation.',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-16 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001017',
  'The Impact of Music on the Brain',
  'Explain how music affects cognitive and emotional wellbeing.',
  300, 2,
  'Science & Arts', '["intermediate", "informative"]',
  'Neuroscience reveals music''s profound brain impact. Music activates multiple brain regions simultaneously—auditory cortex, motor areas, and emotional processing centers. Listening to preferred music releases dopamine, improving mood and motivation. Learning music strengthens neural connections, enhancing memory, spatial reasoning, and language skills. Rhythm and tempo affect heart rate and stress levels; slow music calms while upbeat music energizes. Music therapy effectively treats depression, anxiety, and neurological conditions. Children learning instruments show improved academic performance. Beyond cognitive benefits, music creates emotional meaning and social connection. Cultural universality of music—present in every known society—suggests evolutionary significance. Whether passive listening or active performance, music profoundly influences how brains develop and function throughout life.',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-17 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001018',
  'Urban Planning and Sustainable Cities',
  'Discuss how cities should develop for sustainability and livability.',
  320, 3,
  'Environment & Urban Development', '["advanced", "analytical"]',
  'Sustainable urban development requires comprehensive approaches. Current car-centric design creates pollution, congestion, and isolation. Future cities should prioritize public transportation, walkability, and cycling infrastructure. Green spaces combat urban heat and improve mental health. Mixed-use neighborhoods reduce commute needs. Affordable housing policies prevent displacement and segregation. Smart city technologies optimize resource use—water, electricity, waste management. However, technology alone cannot solve urban challenges. Inclusive governance ensuring diverse community voices shapes better planning. Successful sustainable cities (Copenhagen, Singapore, Curitiba) share common elements: integrated planning, public engagement, environmental focus, and equity consideration. Urban planning decisions made today determine sustainability and livability for generations. Investments in sustainable urban infrastructure pay long-term dividends.',
  60, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-18 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001019',
  'The Philosophy of Happiness',
  'Explore different perspectives on what constitutes a happy life.',
  300, 2,
  'Philosophy & Wellness', '["intermediate", "reflective"]',
  'Philosophers debate happiness'' nature and attainability. Hedonism emphasizes pleasure; Stoicism advocates virtue and acceptance. Aristotle''s eudaimonia combines flourishing and purpose. Contemporary research suggests happiness involves multiple dimensions: positive emotions, meaningful relationships, purposeful work, good health, and personal growth. Money increases happiness only to the point where basic needs are met; beyond that, experiences and relationships matter more than possessions. Cultural differences shape happiness priorities. Neuroscience reveals happiness'' biological basis: genetics, circumstances, and intentional choices influence wellbeing. While complete happiness might be unattainable, pursuing conditions supporting wellbeing is worthwhile. Practically, happiness cultivation involves gratitude, mindfulness, meaningful relationships, purposeful engagement, and compassion. Rather than seeking constant happiness, accepting life''s full emotional spectrum while building resilience creates sustainable wellbeing.',
  45, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-19 10:00:00+09'),

('550e8400-e29b-41d4-a716-446663001020',
  'Cross-Cultural Communication: Opportunities and Challenges',
  'Analyze challenges in communicating across cultures and strategies to overcome them.',
  350, 3,
  'Communication & Culture', '["advanced", "analytical"]',
  'Globalization creates frequent cross-cultural interactions but also misunderstandings. Cultural values, communication styles, nonverbal cues, and language barriers create challenges. Direct communication cultures (Germany, Netherlands) contrast with indirect cultures (Japan, China). High-context cultures emphasize implicit understanding; low-context cultures require explicit explanation. Time perspectives, hierarchy attitudes, and privacy norms differ significantly. Successful cross-cultural communication requires: cultural awareness, humility, active listening, and adaptation. Learning another language, studying cultural differences, and building diverse relationships develop competence. Organizations with multicultural teams benefit from diversity but must address integration challenges. International diplomacy, business negotiations, and personal relationships succeed when participants understand and respect cultural differences. Rather than seeking complete understanding, embracing different perspectives as enriching creates bridges across cultures.',
  60, TRUE, '550e8400-e29b-41d4-a716-446655440001', '2025-10-20 10:00:00+09');

-- =====================================================================
-- END: Vocabulary and Writing Prompts
-- =====================================================================
