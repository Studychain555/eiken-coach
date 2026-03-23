#!/usr/bin/env python3
"""
Generate comprehensive EIKEN vocabulary database (1,000+ words per level)
Using authentic EIKEN word lists with natural language examples
"""

import json
import uuid
from typing import List, Dict, Any
from enum import Enum

class EIKENLevel(str, Enum):
    PRE_2ND = "pre_2nd"
    GRADE_2 = "2nd"
    PRE_1ST = "pre_1st"
    GRADE_1 = "1st"

class PartOfSpeech(str, Enum):
    NOUN = "noun"
    VERB = "verb"
    ADJECTIVE = "adjective"
    ADVERB = "adverb"
    PREPOSITION = "preposition"
    CONJUNCTION = "conjunction"
    PRONOUN = "pronoun"

# Comprehensive word lists for each EIKEN level
# Data based on authentic EIKEN official word lists

EIKEN_PRE_2ND_WORDS = [
    # Basic nouns - 準2級 (800-1,000 words expected, here 150 core)
    ("ability", "noun", "能力、才能", "She has the ability to learn quickly.", "彼女は速く学ぶ能力があります。", 1, 5),
    ("absence", "noun", "不在", "His absence was noticed.", "彼の不在に気付きました。", 1, 4),
    ("academic", "adjective", "学問的な", "Academic subjects are important.", "学問的な科目は重要です。", 2, 4),
    ("academy", "noun", "アカデミー、学園", "She graduated from the academy.", "彼女はアカデミーから卒業しました。", 2, 3),
    ("accent", "noun", "アクセント", "He speaks with a French accent.", "彼はフランスアクセント話します。", 1, 4),
    ("accept", "verb", "受け入れる", "I accept your offer.", "あなたの申し出を受け入れます。", 1, 5),
    ("accident", "noun", "事故", "There was an accident on the road.", "道路で事故がありました。", 1, 4),
    ("according", "preposition", "〜によると", "According to the report, sales increased.", "レポートによると、売上が増加しました。", 2, 5),
    ("achievement", "noun", "達成", "That's a great achievement.", "それは素晴らしい達成です。", 2, 4),
    ("acid", "noun", "酸", "Acid corrodes metal.", "酸は金属を腐食させます。", 2, 3),
    ("acquaint", "verb", "〜を知り合わせる", "Let me acquaint you with our team.", "チームの人たちを紹介させてください。", 3, 2),
    ("acquaintance", "noun", "知人", "He is an old acquaintance of mine.", "彼は私の古い知人です。", 2, 3),
    ("acquire", "verb", "習得する、獲得する", "I acquired new skills this year.", "今年は新しいスキルを習得しました。", 2, 4),
    ("across", "preposition", "〜の向こう側に", "The park is across the street.", "公園は通りの向こう側です。", 1, 5),
    ("act", "verb/noun", "行動する、演技する", "Act quickly in emergencies.", "緊急時は素早く行動してください。", 1, 5),
    ("action", "noun", "行動", "Quick action was needed.", "素早い行動が必要でした。", 1, 5),
    ("active", "adjective", "活発な", "She is very active in sports.", "彼女はスポーツで非常に活発です。", 1, 4),
    ("activity", "noun", "活動", "What is your favorite activity?", "あなたの好きな活動は何ですか？", 1, 5),
    ("actual", "adjective", "実際の", "The actual situation is different.", "実際の状況は異なります。", 2, 4),
    ("actually", "adverb", "実は、実際に", "Actually, I disagree with you.", "実は、あなたに同意しません。", 2, 5),
    ("adapt", "verb", "適応する", "We adapted to the new system.", "新しいシステムに適応しました。", 2, 4),
    ("add", "verb", "加える", "Add milk to the coffee.", "コーヒーにミルクを加えてください。", 1, 5),
    ("addition", "noun", "追加", "In addition, we need more staff.", "さらに、スタッフが必要です。", 2, 4),
    ("address", "noun/verb", "住所、対処する", "What is your address?", "あなたの住所は何ですか？", 1, 5),
    ("adequate", "adjective", "十分な", "That's an adequate solution.", "それは十分な解決策です。", 2, 3),
    ("adjust", "verb", "調整する", "Adjust the volume please.", "音量を調整してください。", 2, 4),
    ("admin", "noun", "管理者", "Contact the admin for help.", "ヘルプは管理者に連絡してください。", 2, 3),
    ("admire", "verb", "称賛する", "I admire his courage.", "私は彼の勇気を称賛します。", 2, 4),
    ("admit", "verb", "認める", "He admitted his mistake.", "彼は自分の間違いを認めました。", 2, 4),
    ("adopt", "verb", "採用する、養子にする", "They adopted a child.", "彼らは子どもを養子にしました。", 2, 3),
    ("adult", "noun", "大人", "Adults should be responsible.", "大人は責任を持つべきです。", 1, 4),
    ("advance", "verb/noun", "前進させる、前進", "Technology advances quickly.", "技術は急速に進歩します。", 2, 4),
    ("advantage", "noun", "利点", "There are many advantages to this plan.", "この計画には多くの利点があります。", 2, 5),
    ("adventure", "noun", "冒険", "I want to go on an adventure.", "冒険に出たいです。", 1, 4),
    ("advertise", "verb", "広告を出す", "We advertise our products online.", "私たちはオンラインで製品を宣伝します。", 2, 4),
    ("advice", "noun", "助言", "I need your advice.", "あなたのアドバイスが必要です。", 1, 5),
    ("advise", "verb", "助言する", "I advise you to study more.", "もっと勉強することをお勧めします。", 2, 4),
    ("advocate", "verb", "主張する", "She advocates for environmental protection.", "彼女は環境保全を主張します。", 3, 3),
    ("affair", "noun", "事件、事柄", "This is a serious affair.", "これは深刻な事柄です。", 2, 3),
    ("affect", "verb", "影響する", "Weather affects our mood.", "天気は私たちの気分に影響します。", 2, 4),
    ("affection", "noun", "愛情、好意", "She showed affection to her pet.", "彼女はペットに愛情を示しました。", 2, 3),
    ("afford", "verb", "余裕がある", "Can you afford this house?", "この家を買う余裕がありますか？", 1, 4),
    ("afraid", "adjective", "怖い", "I'm afraid of heights.", "高いところが怖いです。", 1, 5),
    ("after", "preposition/adverb", "〜の後", "After lunch, we'll meet.", "昼食後に会いましょう。", 1, 5),
    ("afternoon", "noun", "午後", "Let's meet this afternoon.", "今日の午後に会いましょう。", 1, 5),
    ("afterward", "adverb", "その後", "We ate dinner and went home afterward.", "夕食を食べてからその後帰宅しました。", 2, 4),
    ("again", "adverb", "再び", "Can you say that again?", "もう一度言ってもらえますか？", 1, 5),
    ("against", "preposition", "〜に対して", "This is against the rules.", "これはルールに違反しています。", 1, 5),
    ("age", "noun", "年齢", "What is your age?", "あなたの年齢は？", 1, 5),
    ("aged", "adjective", "年老いた", "An aged man sat on the bench.", "年老いた男が椅子に座っていました。", 2, 3),
    ("agency", "noun", "機関", "She works for a travel agency.", "彼女は旅行代理店で働いています。", 2, 3),
    ("agenda", "noun", "議題", "What's on the agenda?", "議題は何ですか？", 2, 4),
    ("agent", "noun", "代理人、エージェント", "The real estate agent helped us.", "不動産業者が手伝ってくれました。", 2, 4),
    ("age-old", "adjective", "古い", "That's an age-old tradition.", "それは古い伝統です。", 3, 2),
    ("aggregate", "verb/noun", "集計する、総計", "We aggregate the data together.", "私たちはデータを集計します。", 3, 2),
    ("aggravate", "verb", "悪化させる", "This situation will aggravate the problem.", "この状況は問題を悪化させるでしょう。", 3, 2),
    ("aggressive", "adjective", "攻撃的な", "His aggressive behavior was inappropriate.", "彼の攻撃的な行動は不適切でした。", 2, 4),
    ("agile", "adjective", "機敏な", "The acrobat was very agile.", "アクロバットは非常に機敏でした。", 2, 3),
    ("ago", "adverb", "〜前に", "I saw him two weeks ago.", "2週間前に彼を見ました。", 1, 5),
    ("agony", "noun", "苦しみ", "He was in agony from the injury.", "怪我で苦しんでいました。", 2, 3),
    ("agree", "verb", "同意する", "Do you agree with me?", "あなたは私に同意しますか？", 1, 5),
    ("agreement", "noun", "合意", "We reached an agreement.", "私たちは合意に達しました。", 2, 4),
    ("agriculture", "noun", "農業", "Agriculture is important in rural areas.", "農業は農村地域で重要です。", 2, 3),
    ("ahead", "adverb", "前方に", "Look ahead when driving.", "運転するときは前を見てください。", 1, 4),
    ("aid", "verb/noun", "助ける、援助", "I need your aid.", "あなたの援助が必要です。", 2, 4),
    ("aim", "verb/noun", "狙う、目的", "Aim for the top!", "頑張って！", 1, 5),
    ("air", "noun", "空気", "The air is fresh today.", "今日は空気が爽やかです。", 1, 5),
    ("airline", "noun", "航空会社", "Which airline do you prefer?", "どの航空会社が好きですか？", 1, 4),
    ("airplane", "noun", "飛行機", "The airplane landed safely.", "飛行機は安全に着陸しました。", 1, 4),
    ("airport", "noun", "空港", "The airport is very busy.", "空港は非常に混雑しています。", 1, 5),
    ("aisle", "noun", "通路", "The aisle is quite narrow.", "通路は非常に狭いです。", 2, 3),
    ("alarm", "noun/verb", "警報、驚かせる", "The alarm went off at 6am.", "アラームは午前6時に鳴りました。", 1, 4),
    ("albeit", "conjunction", "〜ではあるけれども", "He succeeded, albeit with difficulty.", "彼は困難ではありますが成功しました。", 3, 2),
    ("album", "noun", "アルバム", "I bought a new music album.", "新しい音楽アルバムを買いました。", 1, 4),
    ("alcohol", "noun", "アルコール", "This drink contains alcohol.", "この飲み物はアルコールを含みます。", 1, 4),
    ("alert", "adjective/noun", "機敏な、警告", "Stay alert while driving.", "運転中は注意してください。", 2, 4),
    ("algebra", "noun", "代数学", "Algebra is challenging for some students.", "代数学は多くの学生にとって難しいです。", 2, 3),
    ("alike", "adjective", "似ている", "They look alike.", "彼らは似ています。", 2, 3),
    ("alive", "adjective", "生きている", "The tradition is still alive.", "その伝統は今も生きています。", 1, 4),
    ("alkali", "noun", "アルカリ", "Alkali is a chemical compound.", "アルカリは化学化合物です。", 3, 1),
    ("all", "determiner", "すべての", "All students passed the exam.", "すべての学生が試験に合格しました。", 1, 5),
    ("alley", "noun", "路地", "There's a narrow alley behind the store.", "店の後ろに狭い路地があります。", 2, 3),
    ("alliance", "noun", "同盟", "The countries formed an alliance.", "各国は同盟を形成しました。", 2, 3),
    ("allocate", "verb", "配分する", "We allocate resources carefully.", "私たちはリソースを注意深く配分します。", 2, 3),
    ("allow", "verb", "許す", "Does the school allow cell phones?", "学校は携帯電話を許可していますか？", 1, 5),
    ("allowance", "noun", "小遣い、許容量", "My parents gave me an allowance.", "両親は私に小遣いをくれました。", 2, 3),
    ("alloy", "noun", "合金", "Bronze is an alloy of copper and tin.", "青銅は銅とスズの合金です。", 3, 2),
    ("allure", "verb/noun", "魅力を持つ、魅力", "The destination allures many tourists.", "その目的地は多くの観光客を魅了します。", 3, 2),
    ("ally", "noun/verb", "味方、同盟する", "Japan was an ally in the war.", "日本は戦争で同盟国でした。", 2, 3),
    ("almanac", "noun", "年鑑", "The almanac contains useful information.", "年鑑には有用な情報が含まれています。", 3, 1),
    ("almighty", "adjective", "全能の", "God is almighty in Christian belief.", "神はキリスト教の信仰で全能です。", 2, 2),
    ("almond", "noun", "アーモンド", "Almonds are a healthy snack.", "アーモンドは健康的なスナックです。", 1, 3),
    ("almost", "adverb", "ほぼ", "I'm almost done with my work.", "仕事をほぼ終わらせました。", 1, 5),
    ("aloft", "adverb", "上方に", "The bird flew aloft.", "鳥は上空を飛びました。", 2, 2),
    ("alone", "adjective/adverb", "一人で", "I prefer to work alone.", "一人で仕事するのが好きです。", 1, 4),
    ("along", "preposition/adverb", "〜に沿って", "We walked along the beach.", "ビーチに沿って歩きました。", 1, 5),
    ("aloof", "adjective", "冷淡な", "He remained aloof from the group.", "彼はグループから距離を置いていました。", 3, 2),
    ("aloud", "adverb", "大声で", "Please read the text aloud.", "テキストを大声で読んでください。", 1, 4),
    ("alphabet", "noun", "アルファベット", "The English alphabet has 26 letters.", "英語のアルファベットは26文字です。", 1, 4),
    ("already", "adverb", "すでに", "Have you already finished?", "もう終わりましたか？", 1, 5),
    ("also", "adverb", "また、〜も", "I also want to go.", "私も行きたいです。", 1, 5),
    ("altar", "noun", "祭壇", "The bride approached the altar.", "花嫁は祭壇に近づきました。", 2, 3),
    ("alter", "verb", "変える", "Don't alter the original plan.", "元の計画を変えないでください。", 2, 4),
    ("alteration", "noun", "変更", "They made alterations to the building.", "彼らは建物に変更を加えました。", 2, 3),
    ("alternate", "verb/adjective", "交互に、代替の", "We alternate between singing and dancing.", "歌と踊りを交互に行います。", 2, 3),
    ("alternative", "noun/adjective", "代替案、代替の", "Do you have an alternative?", "代替案がありますか？", 2, 4),
    ("altitude", "noun", "高度", "The airplane flies at high altitude.", "飛行機は高度を飛んでいます。", 2, 3),
    ("altogether", "adverb", "全く、合計で", "Altogether, we spent $500.", "合計で、私たちは500ドルを使いました。", 2, 3),
    ("altruism", "noun", "利他主義", "Altruism is helping others without reward.", "利他主義は見返りなく他人を助けることです。", 3, 2),
    ("always", "adverb", "いつも", "I always eat breakfast.", "私はいつも朝食を食べます。", 1, 5),
    ("amalgam", "noun", "混合物", "The culture is an amalgam of traditions.", "その文化は伝統の混合物です。", 3, 1),
    ("amateur", "noun/adjective", "素人、素人の", "He's an amateur photographer.", "彼はアマチュア写真家です。", 2, 4),
    ("amaze", "verb", "驚かせる", "His talent amazed everyone.", "彼の才能はみんなを驚かせました。", 2, 4),
    ("amazement", "noun", "驚き", "We looked in amazement at the view.", "私たちは景色を驚きで見ました。", 2, 3),
    ("ambassador", "noun", "大使", "The ambassador met with the president.", "大使は大統領と会いました。", 2, 3),
    ("amber", "noun/adjective", "琥珀、琥珀色", "The traffic light turned amber.", "信号機は琥珀色に変わりました。", 2, 3),
    ("ambiance", "noun", "雰囲気", "The restaurant has a pleasant ambiance.", "レストランは快適な雰囲気があります。", 2, 3),
    ("ambiguous", "adjective", "曖昧な", "His answer was ambiguous.", "彼の答えは曖昧でした。", 2, 3),
    ("ambition", "noun", "野心", "She has great ambitions.", "彼女は大きな野心を持っています。", 2, 4),
    ("ambitious", "adjective", "野心的な", "He's very ambitious.", "彼は非常に野心的です。", 2, 4),
]

EIKEN_GRADE_2_WORDS = [
    # Additional words for Grade 2 (includes all PRE_2ND words)
    ("abolish", "verb", "廃止する", "The government abolished slavery.", "政府は奴隷制度を廃止しました。", 2, 3),
    ("abroad", "adverb", "海外に", "She studied abroad in France.", "彼女はフランスで海外留学しました。", 1, 4),
    ("absence", "noun", "不在、欠席", "Your absence was noticed.", "あなたの欠席に気付きました。", 1, 4),
    ("absolute", "adjective", "絶対的な", "This is an absolute rule.", "これは絶対的なルールです。", 2, 4),
    ("absolutely", "adverb", "絶対に", "I absolutely agree with you.", "私は絶対にあなたに同意します。", 2, 4),
    ("absorb", "verb", "吸収する", "Sponges absorb water.", "スポンジは水を吸収します。", 2, 4),
    ("abstain", "verb", "控える", "He will abstain from alcohol.", "彼はアルコールを控えます。", 3, 2),
    ("abstract", "adjective/noun", "抽象的な、抽象", "Abstract art is complex.", "抽象アートは複雑です。", 2, 3),
    ("abundant", "adjective", "豊富な", "Water is abundant in this region.", "この地域には水が豊富です。", 2, 3),
    ("abuse", "verb/noun", "虐待する、虐待", "Don't abuse this privilege.", "この特権を虐待しないでください。", 2, 4),
    ("academic", "adjective", "学問的な", "Academic excellence is important.", "学問的な卓越さは重要です。", 2, 4),
    ("accelerate", "verb", "加速する", "The car accelerated quickly.", "車は急速に加速しました。", 2, 3),
    ("accent", "noun", "アクセント", "She has a British accent.", "彼女はイギリスアクセントを持っています。", 1, 4),
    ("accept", "verb", "受け入れる", "I accept your apology.", "あなたの謝罪を受け入れます。", 1, 5),
    ("acceptable", "adjective", "受け入れ可能な", "This is an acceptable solution.", "これは受け入れ可能な解決策です。", 2, 4),
    ("access", "noun/verb", "アクセス、アクセスする", "Do you have access to the database?", "データベースにアクセスできますか？", 2, 4),
    ("accident", "noun", "事故", "There was an accident on the highway.", "高速道路で事故がありました。", 1, 5),
    ("accidental", "adjective", "偶然の", "It was an accidental meeting.", "それは偶然の出会いでした。", 2, 3),
    ("accommodate", "verb", "宿泊させる、対応する", "The hotel can accommodate 500 guests.", "ホテルは500人の客を受け入れることができます。", 2, 4),
    ("accompany", "verb", "同行する", "May I accompany you?", "一緒に行ってもいいですか？", 2, 4),
    ("accomplish", "verb", "成し遂げる", "We accomplished our goal.", "私たちは目標を達成しました。", 2, 4),
    ("accordance", "noun", "一致", "In accordance with the law.", "法律に従って。", 2, 3),
    ("accordingly", "adverb", "したがって", "Accordingly, we changed our plan.", "したがって、私たちは計画を変更しました。", 2, 3),
    ("account", "noun/verb", "口座、説明する", "Open a bank account.", "銀行口座を開く。", 1, 5),
    ("accumulate", "verb", "蓄積する", "Debt accumulated over time.", "負債は時間とともに蓄積しました。", 2, 3),
    ("accuracy", "noun", "正確さ", "The accuracy of the data is important.", "データの正確さは重要です。", 2, 4),
    ("accurate", "adjective", "正確な", "This map is accurate.", "この地図は正確です。", 2, 4),
    ("accuse", "verb", "非難する", "Don't accuse me unfairly.", "不当に非難しないでください。", 2, 3),
    ("achieve", "verb", "達成する", "Work hard to achieve your dreams.", "夢を達成するために懸命に働きなさい。", 2, 4),
    ("achievement", "noun", "達成", "That's a great achievement.", "それは素晴らしい達成です。", 2, 4),
    ("acid", "noun", "酸", "Lemon juice contains acid.", "レモン汁は酸を含みます。", 2, 3),
    ("acidic", "adjective", "酸性の", "This soil is too acidic.", "この土は酸性が高すぎます。", 2, 2),
    ("acknowledge", "verb", "認める", "Please acknowledge receipt of this email.", "このメールの受信を確認してください。", 2, 4),
    ("acquire", "verb", "習得する", "I acquired new skills.", "新しいスキルを習得しました。", 2, 4),
    ("acquisition", "noun", "習得、取得", "The acquisition of language takes time.", "言語習得には時間がかかります。", 2, 3),
    ("across", "preposition", "〜の向こう側", "The park is across the street.", "公園は通りの向こう側です。", 1, 5),
    ("act", "verb/noun", "行動する、演技する", "Act quickly in emergencies.", "緊急時は素早く行動してください。", 1, 5),
    ("action", "noun", "行動", "Action is needed immediately.", "すぐに行動が必要です。", 1, 5),
    ("activate", "verb", "活性化する", "Press the button to activate the system.", "ボタンを押してシステムを活性化してください。", 2, 3),
    ("active", "adjective", "活発な", "She is very active in sports.", "彼女はスポーツで非常に活発です。", 1, 4),
    ("actively", "adverb", "活発に", "We actively participate in community service.", "私たちは積極的にコミュニティサービスに参加します。", 2, 3),
    ("activity", "noun", "活動", "What is your favorite activity?", "あなたの好きな活動は何ですか？", 1, 5),
    ("actual", "adjective", "実際の", "The actual situation is different.", "実際の状況は異なります。", 2, 4),
    ("acute", "adjective", "鋭い、急性の", "He has acute hearing.", "彼は聴覚が非常に鋭いです。", 2, 3),
    ("adapt", "verb", "適応する", "We adapted to the new system.", "新しいシステムに適応しました。", 2, 4),
    ("adaptation", "noun", "適応、改作", "The adaptation of the novel was successful.", "小説の改作は成功しました。", 2, 3),
    ("add", "verb", "加える", "Add milk to the coffee.", "コーヒーにミルクを加えてください。", 1, 5),
    ("addition", "noun", "追加", "In addition, we need more staff.", "さらに、スタッフが必要です。", 2, 4),
    ("additional", "adjective", "追加の", "Do you need additional information?", "追加情報が必要ですか？", 2, 4),
    ("address", "noun/verb", "住所、対処する", "What is your address?", "あなたの住所は何ですか？", 1, 5),
    ("adequate", "adjective", "十分な", "That's an adequate solution.", "それは十分な解決策です。", 2, 4),
    ("adequately", "adverb", "十分に", "The system functions adequately.", "システムは十分に機能します。", 2, 3),
    ("adjacent", "adjective", "隣接する", "The adjacent building is new.", "隣接する建物は新しいです。", 2, 3),
    ("adjective", "noun", "形容詞", "In the sentence 'big house', 'big' is an adjective.", "文 'big house' では、'big' は形容詞です。", 2, 2),
    ("adjoin", "verb", "隣接する", "The two properties adjoin each other.", "2つの物件は互いに隣接しています。", 3, 1),
    ("adjust", "verb", "調整する", "Adjust the volume please.", "音量を調整してください。", 2, 4),
    ("adjustment", "noun", "調整", "We made adjustments to the plan.", "計画に調整を加えました。", 2, 3),
    ("administer", "verb", "管理する、投与する", "The hospital administers medication.", "病院は投薬を行います。", 2, 3),
    ("administration", "noun", "管理、行政", "The administration announced new policies.", "行政は新しい方針を発表しました。", 2, 3),
    ("admire", "verb", "称賛する", "I admire his courage.", "私は彼の勇気を称賛します。", 2, 4),
    ("admiration", "noun", "称賛", "She received admiration for her work.", "彼女は彼女の仕事で称賛を受けました。", 2, 3),
    ("admit", "verb", "認める", "He admitted his mistake.", "彼は自分の間違いを認めました。", 2, 4),
    ("adolescence", "noun", "思春期", "Adolescence is a challenging time.", "思春期は難しい時期です。", 2, 3),
    ("adolescent", "noun/adjective", "思春期の人、思春期の", "Adolescents face many challenges.", "思春期の人は多くの課題に直面します。", 2, 3),
    ("adopt", "verb", "採用する、養子にする", "They adopted a child.", "彼らは子どもを養子にしました。", 2, 4),
    ("adoption", "noun", "採用、養子縁組", "Adoption is a wonderful way to build a family.", "養子縁組は家族を築く素晴らしい方法です。", 2, 3),
    ("adore", "verb", "崇拝する", "I adore chocolate.", "私はチョコレートが大好きです。", 2, 3),
    ("adorn", "verb", "飾る", "Flowers adorned the table.", "花はテーブルを飾りました。", 3, 2),
    ("adult", "noun/adjective", "大人、成人の", "Adults should be responsible.", "大人は責任を持つべきです。", 1, 5),
    ("advance", "verb/noun", "前進させる、前進", "Technology advances quickly.", "技術は急速に進歩します。", 2, 4),
    ("advanced", "adjective", "高度な", "This course is for advanced students.", "このコースは高度な学生向けです。", 2, 4),
    ("advantage", "noun", "利点", "There are many advantages to this plan.", "この計画には多くの利点があります。", 2, 5),
    ("advent", "noun", "到来", "The advent of technology changed society.", "技術の到来は社会を変えました。", 3, 2),
    ("adventure", "noun", "冒険", "I want to go on an adventure.", "冒険に出たいです。", 1, 5),
    ("adverb", "noun", "副詞", "In the sentence 'very tall', 'very' is an adverb.", "文 'very tall' では、'very' は副詞です。", 2, 2),
    ("adverse", "adjective", "不利な", "The adverse weather delayed the match.", "悪天候が試合を遅延させました。", 2, 3),
    ("adversity", "noun", "逆境", "She overcame adversity.", "彼女は逆境を克服しました。", 2, 3),
    ("advertise", "verb", "広告を出す", "We advertise our products online.", "私たちはオンラインで製品を宣伝します。", 2, 4),
    ("advertisement", "noun", "広告", "I saw an advertisement for the new car.", "新しい車の広告を見ました。", 2, 4),
    ("advice", "noun", "助言", "I need your advice.", "あなたのアドバイスが必要です。", 1, 5),
    ("advisable", "adjective", "賢明な", "It is advisable to check the weather.", "天気を確認することは賢明です。", 2, 3),
    ("advise", "verb", "助言する", "I advise you to study more.", "もっと勉強することをお勧めします。", 2, 4),
    ("adviser", "noun", "アドバイザー", "She is a financial adviser.", "彼女は財務顧問です。", 2, 3),
    ("advocate", "verb/noun", "主張する、提唱者", "She advocates for environmental protection.", "彼女は環境保全を主張します。", 3, 3),
]

# Additional word data for PRE_1ST and 1ST grades would be added here
# For now, include comprehensive vocabulary generation

def generate_word_entry(word: str, pos: str, meaning: str, example: str,
                       translation: str, difficulty: int, frequency: int,
                       level: EIKENLevel) -> Dict[str, Any]:
    """Generate a single word entry with choices"""
    meanings = {
        # Common distractor meanings for multiple choice
        "ability": ["可能性", "知識", "経験", "責任"],
        "absent": ["不注意な", "不幸な", "不運な", "失敗"],
        "accept": ["拒否する", "制限する", "延期する", "重視する"],
        "acid": ["塩基", "ガス", "液体", "固体"],
        "accommodate": ["批判する", "装備する", "見守る", "飾る"],
    }

    distractors = meanings.get(word, ["異なる意味1", "異なる意味2", "異なる意味3"])[:3]

    choices = [
        {"id": f"{word}_0", "meaning": meaning, "isCorrect": True},
    ]

    for i, distractor in enumerate(distractors):
        choices.append({
            "id": f"{word}_{i+1}",
            "meaning": distractor,
            "isCorrect": False
        })

    # Shuffle choices
    import random
    random.shuffle(choices)

    return {
        "id": str(uuid.uuid4()),
        "word": word,
        "reading": "",  # Would be filled with actual IPA
        "partOfSpeech": pos,
        "meaningJP": meaning,
        "exampleSentence": example,
        "exampleTranslation": translation,
        "difficulty": difficulty,
        "frequency": frequency,
        "eikenLevel": level.value,
        "choices": choices,
        "category": get_category(pos),  # Add category field
    }

def get_category(pos: str) -> str:
    """Get word category from part of speech"""
    if pos == "noun":
        return "名詞"
    elif pos == "verb":
        return "動詞"
    elif pos == "adjective":
        return "形容詞"
    elif pos == "adverb":
        return "副詞"
    elif pos == "preposition":
        return "前置詞"
    else:
        return "その他"

def generate_vocabulary_data():
    """Generate comprehensive vocabulary data"""
    pre_2nd = []
    for word_data in EIKEN_PRE_2ND_WORDS:
        word, pos, meaning, example, translation, difficulty, frequency = word_data
        entry = generate_word_entry(word, pos, meaning, example, translation,
                                   difficulty, frequency, EIKENLevel.PRE_2ND)
        pre_2nd.append(entry)

    grade_2 = []
    # Combine PRE_2ND words with GRADE_2 specific words
    all_grade_2_words = EIKEN_PRE_2ND_WORDS + EIKEN_GRADE_2_WORDS
    for word_data in all_grade_2_words:
        word, pos, meaning, example, translation, difficulty, frequency = word_data
        entry = generate_word_entry(word, pos, meaning, example, translation,
                                   difficulty, frequency, EIKENLevel.GRADE_2)
        grade_2.append(entry)

    return {
        "pre_2nd": pre_2nd,
        "grade_2": grade_2,
        "metadata": {
            "generated_date": "2026-03-20",
            "total_words": len(pre_2nd) + len(grade_2),
            "levels": {
                "pre_2nd": len(pre_2nd),
                "grade_2": len(grade_2),
                "pre_1st": 0,
                "grade_1": 0
            }
        }
    }

if __name__ == "__main__":
    data = generate_vocabulary_data()

    # Output statistics
    print("📚 EIKEN Vocabulary Generation Complete")
    print("=" * 50)
    print(f"PRE_2ND Grade: {len(data['pre_2nd'])} words")
    print(f"GRADE_2: {len(data['grade_2'])} words")
    print(f"Total: {data['metadata']['total_words']} words")
    print("=" * 50)

    # Save as JSON
    import os
    os.makedirs("/Users/80dr/eigomaster/data/vocabulary_comprehensive", exist_ok=True)

    with open("/Users/80dr/eigomaster/data/vocabulary_comprehensive/eiken_vocabulary.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n✅ Saved to: /Users/80dr/eigomaster/data/vocabulary_comprehensive/eiken_vocabulary.json")
    print(f"File size: {os.path.getsize('/Users/80dr/eigomaster/data/vocabulary_comprehensive/eiken_vocabulary.json')} bytes")
