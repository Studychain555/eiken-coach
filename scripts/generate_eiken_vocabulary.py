#!/usr/bin/env python3
"""
EIKEN Vocabulary Data Generation Script
Generates CSV files with vocabulary words for all EIKEN levels
"""

import csv
import json
import uuid
from typing import List, Dict, Tuple
from pathlib import Path

# ==========================================
# EIKEN Vocabulary Data
# ==========================================

# EIKEN 準2級 (Pre-2nd Grade) - 800-1,000 words
EIKEN_PRE_2ND = [
    {
        'word': 'ability', 'reading': 'əˈbɪləti', 'pos': 'noun',
        'meaning_jp': '能力、才能',
        'example': 'She has the ability to speak three languages.',
        'translation': '彼女は3言語を話す能力があります。',
        'difficulty': 1,
        'frequency': 5,
        'choices': [
            ('能力、才能', True, 1),
            ('可能性、見込み', False, 2),
            ('責任、義務', False, 2),
            ('知識、学問', False, 2),
        ]
    },
    {
        'word': 'accommodate', 'reading': 'əˈkɑmədeɪt', 'pos': 'verb',
        'meaning_jp': '宿泊させる、対応する',
        'example': 'The hotel can accommodate 500 guests.',
        'translation': 'ホテルは500人の客を受け入れることができます。',
        'difficulty': 2,
        'frequency': 3,
        'choices': [
            ('宿泊させる、対応する', True, 1),
            ('装備する、備える', False, 2),
            ('見守る、監視する', False, 2),
            ('飾る、装飾する', False, 2),
        ]
    },
    {
        'word': 'achievement', 'reading': 'əˈtʃiːvmənt', 'pos': 'noun',
        'meaning_jp': '成果、達成',
        'example': 'His academic achievement was impressive.',
        'translation': '彼の学業成果は印象的でした。',
        'difficulty': 1,
        'frequency': 4,
        'choices': [
            ('成果、達成', True, 1),
            ('努力、試み', False, 2),
            ('富、資産', False, 2),
            ('計画、構想', False, 2),
        ]
    },
    {
        'word': 'acquire', 'reading': 'əˈkwaɪər', 'pos': 'verb',
        'meaning_jp': '取得する、習得する',
        'example': 'You can acquire new skills through practice.',
        'translation': '練習を通じて新しいスキルを習得できます。',
        'difficulty': 2,
        'frequency': 4,
        'choices': [
            ('取得する、習得する', True, 1),
            ('求める、要求する', False, 2),
            ('応じる、答える', False, 2),
            ('認める、承認する', False, 2),
        ]
    },
    {
        'word': 'adapt', 'reading': 'əˈdæpt', 'pos': 'verb',
        'meaning_jp': '適応する、順応する',
        'example': 'People adapt to new environments over time.',
        'translation': '人々は時間とともに新しい環境に適応します。',
        'difficulty': 1,
        'frequency': 4,
        'choices': [
            ('適応する、順応する', True, 1),
            ('採用する、取り入れる', False, 2),
            ('装着する、取り付ける', False, 2),
            ('調整する、修正する', False, 2),
        ]
    },
    {
        'word': 'adequate', 'reading': 'ˈædɪkwət', 'pos': 'adjective',
        'meaning_jp': '十分な、妥当な',
        'example': 'The budget is adequate for the project.',
        'translation': ' 予算はプロジェクトに十分です。',
        'difficulty': 2,
        'frequency': 3,
        'choices': [
            ('十分な、妥当な', True, 1),
            ('適切な、ふさわしい', False, 2),
            ('完全な、完璧な', False, 2),
            ('素晴らしい、素敵な', False, 2),
        ]
    },
    {
        'word': 'advantage', 'reading': 'ədˈvæntɪdʒ', 'pos': 'noun',
        'meaning_jp': '利点、有利な立場',
        'example': 'Technology gives us many advantages.',
        'translation': '技術は私たちに多くの利点をもたらします。',
        'difficulty': 1,
        'frequency': 4,
        'choices': [
            ('利点、有利な立場', True, 1),
            ('進歩、改善', False, 2),
            ('許可、同意', False, 2),
            ('進展、発展', False, 2),
        ]
    },
    {
        'word': 'advise', 'reading': 'ədˈvaɪz', 'pos': 'verb',
        'meaning_jp': '忠告する、助言する',
        'example': 'I advise you to study harder.',
        'translation': 'もっと一生懸命勉強することをお勧めします。',
        'difficulty': 1,
        'frequency': 4,
        'choices': [
            ('忠告する、助言する', True, 1),
            ('宣伝する、告知する', False, 2),
            ('激励する、勇気付ける', False, 2),
            ('推奨する、提案する', False, 2),
        ]
    },
    {
        'word': 'afford', 'reading': 'əˈfɔrd', 'pos': 'verb',
        'meaning_jp': '余裕がある、負担できる',
        'example': 'Can you afford this car?',
        'translation': 'この車を買う余裕がありますか？',
        'difficulty': 1,
        'frequency': 3,
        'choices': [
            ('余裕がある、負担できる', True, 1),
            ('提供する、与える', False, 2),
            ('得る、獲得する', False, 2),
            ('見つける、発見する', False, 2),
        ]
    },
    {
        'word': 'agreement', 'reading': 'əˈɡriːmənt', 'pos': 'noun',
        'meaning_jp': '同意、合意',
        'example': 'They reached an agreement on the contract.',
        'translation': '彼らは契約について合意に達しました。',
        'difficulty': 1,
        'frequency': 4,
        'choices': [
            ('同意、合意', True, 1),
            ('議論、討論', False, 2),
            ('不満、不平', False, 2),
            ('確認、検証', False, 2),
        ]
    },
]

# EIKEN 2級 (2nd Grade) - 1,500-2,000 words (includes Pre-2nd + new)
EIKEN_GRADE_2_NEW = [
    {
        'word': 'abundance', 'reading': 'əˈbʌndəns', 'pos': 'noun',
        'meaning_jp': '豊富、大量',
        'example': 'The abundance of resources in the region is remarkable.',
        'translation': 'その地域の豊富なリソースは注目に値します。',
        'difficulty': 2,
        'frequency': 3,
        'choices': [
            ('豊富、大量', True, 1),
            ('増加、上昇', False, 2),
            ('富、財産', False, 2),
            ('存在、存在物', False, 2),
        ]
    },
    {
        'word': 'abstract', 'reading': 'ˈæbstrækt', 'pos': 'adjective',
        'meaning_jp': '抽象的な、理論的な',
        'example': 'Mathematics deals with abstract concepts.',
        'translation': '数学は抽象的な概念を扱っています。',
        'difficulty': 2,
        'frequency': 3,
        'choices': [
            ('抽象的な、理論的な', True, 1),
            ('漠然とした、曖昧な', False, 2),
            ('難しい、複雑な', False, 2),
            ('簡潔な、要約した', False, 2),
        ]
    },
    {
        'word': 'accelerate', 'reading': 'ækˈseləreɪt', 'pos': 'verb',
        'meaning_jp': '加速する、速める',
        'example': 'The car accelerated on the highway.',
        'translation': '車は高速道路で加速しました。',
        'difficulty': 2,
        'frequency': 3,
        'choices': [
            ('加速する、速める', True, 1),
            ('上昇する、登る', False, 2),
            ('始まる、開始する', False, 2),
            ('完了する、終わる', False, 2),
        ]
    },
    {
        'word': 'accommodate', 'reading': 'əˈkɑmədeɪt', 'pos': 'verb',
        'meaning_jp': '宿泊させる、対応する',
        'example': 'The hotel accommodates 500 guests per night.',
        'translation': 'ホテルは1晩に500人の客を受け入れます。',
        'difficulty': 2,
        'frequency': 3,
        'choices': [
            ('宿泊させる、対応する', True, 1),
            ('一致する、合致する', False, 2),
            ('補足する、付け加える', False, 2),
            ('逆らう、反対する', False, 2),
        ]
    },
    {
        'word': 'accomplish', 'reading': 'əˈkɑmplɪʃ', 'pos': 'verb',
        'meaning_jp': '成し遂げる、達成する',
        'example': 'He accomplished his goals through hard work.',
        'translation': '彼は懸命な努力を通じて目標を達成しました。',
        'difficulty': 2,
        'frequency': 3,
        'choices': [
            ('成し遂げる、達成する', True, 1),
            ('補完する、補う', False, 2),
            ('計算する、算出する', True, 1),
            ('伴う、付き添う', False, 2),
        ]
    },
]

# EIKEN 準1級 (Pre-1st Grade) - 2,500-3,500 words
EIKEN_PRE_1ST_NEW = [
    {
        'word': 'ambiguous', 'reading': 'æmˈbɪɡjuəs', 'pos': 'adjective',
        'meaning_jp': '曖昧な、あいまいな',
        'example': 'The statement is ambiguous and can be interpreted in multiple ways.',
        'translation': 'その声明は曖昧で、複数の方法で解釈できます。',
        'difficulty': 3,
        'frequency': 3,
        'choices': [
            ('曖昧な、あいまいな', True, 1),
            ('不明確な、はっきりしない', False, 2),
            ('複雑な、難しい', False, 2),
            ('疑わしい、怪しい', False, 2),
        ]
    },
    {
        'word': 'analogous', 'reading': 'əˈnæləɡəs', 'pos': 'adjective',
        'meaning_jp': '類似の、相当する',
        'example': 'This situation is analogous to what happened last year.',
        'translation': 'この状況は昨年起こったことに類似しています。',
        'difficulty': 3,
        'frequency': 2,
        'choices': [
            ('類似の、相当する', True, 1),
            ('平行の、並行の', False, 2),
            ('正確な、精密な', False, 2),
            ('均等な、公平な', False, 2),
        ]
    },
    {
        'word': 'antagonism', 'reading': 'ænˈtæɡənɪzəm', 'pos': 'noun',
        'meaning_jp': '対抗、敵意',
        'example': 'There is deep antagonism between the two groups.',
        'translation': '2つのグループ間に深い敵意があります。',
        'difficulty': 3,
        'frequency': 2,
        'choices': [
            ('対抗、敵意', True, 1),
            ('対比、比較', False, 2),
            ('矛盾、不一致', False, 2),
            ('対立、紛争', False, 2),
        ]
    },
    {
        'word': 'arbitrary', 'reading': 'ˈɑrbɪˌtrer i', 'pos': 'adjective',
        'meaning_jp': '恣意的な、気ままな',
        'example': 'The decision seemed arbitrary and unfair.',
        'translation': 'その決定は恣意的で不公平に見えました。',
        'difficulty': 3,
        'frequency': 2,
        'choices': [
            ('恣意的な、気ままな', True, 1),
            ('根拠のない、無根拠な', False, 2),
            ('不合理な、理不尽な', False, 2),
            ('専断的な、独裁的な', False, 2),
        ]
    },
    {
        'word': 'articulate', 'reading': 'ɑrˈtɪkjələt', 'pos': 'verb/adjective',
        'meaning_jp': '表現する、明確に述べる',
        'example': 'She articulated her concerns clearly and persuasively.',
        'translation': '彼女は彼女の懸念を明確かつ説得力を持って表現しました。',
        'difficulty': 3,
        'frequency': 2,
        'choices': [
            ('表現する、明確に述べる', True, 1),
            ('関連させる、つなげる', False, 2),
            ('区別する、区分する', False, 2),
            ('証明する、立証する', False, 2),
        ]
    },
]

# EIKEN 1級 (1st Grade) - 3,500-5,000+ words
EIKEN_GRADE_1_NEW = [
    {
        'word': 'aberration', 'reading': 'ˌæbəˈreɪʃən', 'pos': 'noun',
        'meaning_jp': '逸脱、異常',
        'example': 'This behavior is an aberration from the norm.',
        'translation': 'この振る舞いは規範からの逸脱です。',
        'difficulty': 4,
        'frequency': 2,
        'choices': [
            ('逸脱、異常', True, 1),
            ('抽象化、概要', False, 2),
            ('誤謬、誤り', False, 2),
            ('偏差、偏移', False, 2),
        ]
    },
    {
        'word': 'abjure', 'reading': 'əbˈdʒʊr', 'pos': 'verb',
        'meaning_jp': '誓って放棄する、拒否する',
        'example': 'He abjured his former political beliefs.',
        'translation': '彼は以前の政治的信念を誓って放棄しました。',
        'difficulty': 4,
        'frequency': 1,
        'choices': [
            ('誓って放棄する、拒否する', True, 1),
            ('非難する、責める', False, 2),
            ('隔離する、分離する', False, 2),
            ('縮小する、減らす', False, 2),
        ]
    },
    {
        'word': 'abnegation', 'reading': 'ˌæbnɪˈɡeɪʃən', 'pos': 'noun',
        'meaning_jp': '放棄、否定',
        'example': 'His abnegation of personal comfort was admirable.',
        'translation': '彼の個人的な快適さの放棄は称賛に値します。',
        'difficulty': 4,
        'frequency': 1,
        'choices': [
            ('放棄、否定', True, 1),
            ('拒否、反論', False, 2),
            ('矛盾、相反', False, 2),
            ('欠陥、欠落', False, 2),
        ]
    },
    {
        'word': 'abstruse', 'reading': 'æbˈstrus', 'pos': 'adjective',
        'meaning_jp': '難解な、難しい',
        'example': 'The philosophical text is quite abstruse.',
        'translation': 'その哲学的なテキストは非常に難解です。',
        'difficulty': 4,
        'frequency': 2,
        'choices': [
            ('難解な、難しい', True, 1),
            ('抽象的な、概念的な', False, 2),
            ('複雑な、複雑化した', False, 2),
            ('曖昧な、不明確な', False, 2),
        ]
    },
    {
        'word': 'acculturation', 'reading': 'əˌkʌltʃəˈreɪʃən', 'pos': 'noun',
        'meaning_jp': '文化適応、同化',
        'example': 'Acculturation helps immigrants integrate into society.',
        'translation': '文化適応は移民が社会に統合するのに役立ちます。',
        'difficulty': 4,
        'frequency': 2,
        'choices': [
            ('文化適応、同化', True, 1),
            ('文化的進化、発展', False, 2),
            ('文化遺産、伝統', False, 2),
            ('文化的差異、多様性', False, 2),
        ]
    },
]

def generate_csv(data: List[Dict], filename: str, level: str):
    """Generate CSV file from vocabulary data"""
    output_path = Path(f'/Users/80dr/eigomaster/data/vocabulary/{level}_{filename}.csv')
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        # Headers
        writer.writerow([
            'id', 'word', 'reading', 'part_of_speech',
            'meaning_jp', 'example_sentence', 'example_translation',
            'difficulty', 'frequency',
            'choice1_meaning', 'choice1_is_correct',
            'choice2_meaning', 'choice2_is_correct',
            'choice3_meaning', 'choice3_is_correct',
            'choice4_meaning', 'choice4_is_correct'
        ])

        # Data rows
        for item in data:
            row = [
                str(uuid.uuid4()),  # id
                item['word'],
                item['reading'],
                item['pos'],
                item['meaning_jp'],
                item['example'],
                item['translation'],
                item['difficulty'],
                item['frequency'],
            ]
            # Add choices
            for choice_meaning, is_correct, difficulty in item['choices']:
                row.append(choice_meaning)
                row.append(is_correct)

            writer.writerow(row)

    print(f'✅ Created {output_path.name} with {len(data)} words')

def main():
    print('🎓 EIKEN Vocabulary Data Generation\n')

    # Generate for each level
    print('📝 Generating EIKEN 準2級 data...')
    generate_csv(EIKEN_PRE_2ND, 'pre_2nd', 'pre_2nd')

    print('📝 Generating EIKEN 2級 data...')
    all_grade_2 = EIKEN_PRE_2ND + EIKEN_GRADE_2_NEW
    generate_csv(all_grade_2, 'grade_2', '2nd')

    print('📝 Generating EIKEN 準1級 data...')
    all_pre_1st = EIKEN_PRE_2ND + EIKEN_GRADE_2_NEW + EIKEN_PRE_1ST_NEW
    generate_csv(all_pre_1st, 'pre_1st', 'pre_1st')

    print('📝 Generating EIKEN 1級 data...')
    all_grade_1 = EIKEN_PRE_2ND + EIKEN_GRADE_2_NEW + EIKEN_PRE_1ST_NEW + EIKEN_GRADE_1_NEW
    generate_csv(all_grade_1, 'grade_1', '1st')

    print('\n✨ Data generation complete!')
    print('\nSummary:')
    print(f'  準2級: {len(EIKEN_PRE_2ND)} words')
    print(f'  2級: {len(all_grade_2)} words')
    print(f'  準1級: {len(all_pre_1st)} words')
    print(f'  1級: {len(all_grade_1)} words')

if __name__ == '__main__':
    main()
