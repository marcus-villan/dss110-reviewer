// Source of truth for the question bank. Run:  node build/questions.mjs
// It writes data/questions.json (used by the site and by the admin "import" button).
//
// Topics: co1, co2, co3-sup, co3-app, co3-tree, co3-kmeans, case
// kind:   mc (multiple choice), tf (true/false), card (flashcard only: prompt = front, explanation = back)
// Items marked verify:true were reconstructed because the PDF did not show the exact blank, the exact
// answer, or the question itself. Check them in the admin page and correct against your lecture slides.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const Q = [];
const TF = ['True', 'False'];
const add = (id, topic, kind, prompt, options, answer, explanation = '', o = {}) =>
  Q.push({
    id, topic, kind, prompt, options, answer, explanation,
    is_code: !!o.code, verify: !!o.verify, source: o.src || '',
  });
const card = (id, topic, front, back, o = {}) => add(id, topic, 'card', front, [], null, back, o);

/* =====================================================================
   CO1 · SA1  (lifecycle, data collection, preprocessing, visualization)
   ===================================================================== */
const SA1 = (n) => ({ src: `SA1 Q${n}` });

add('sa1-01', 'co1', 'tf',
  'Phase 4 involves building, testing, and evaluating models using training and hold-out test data.',
  TF, 0,
  'True. Phase 4 (model building) builds, tests, and evaluates models using training and hold-out test data.', SA1(1));

add('sa1-02', 'co1', 'mc',
  'Model planning in Phase 3 involves selecting variables and the most suitable ____.',
  ['models', 'parameters', 'databases', 'reports'], 0,
  "Phase 3 (model planning) selects variables and the most suitable models. 'Parameters' is a common slip; building and tuning happen in Phase 4.", SA1(2));

add('sa1-03', 'co1', 'mc',
  'ETLT stands for ____, and highlights a different data flow than traditional ETL.',
  ['extract, transform, load, and transform', 'extract, transform, and load', 'extract, test, load, and train', 'evaluate, transform, load, and test'], 0,
  'ETLT = Extract, Transform, Load, Transform. It adds a second transform step after the data is loaded.', SA1(3));

add('sa1-04', 'co1', 'mc',
  'The analytic ____ is a separate space from production data used for exploration and experiments.',
  ['sandbox', 'warehouse', 'cluster', 'pipeline'], 0,
  'The analytic sandbox keeps exploration and experiments away from production data.', SA1(4));

add('sa1-05', 'co1', 'mc',
  '____ is a data preprocessing technique wherein each parameter value is obtained by dividing by magnitude.',
  ['Normalizer', 'MinMaxScaler', 'StandardScaler', 'RobustScaler'], 0,
  'The Normalizer rescales each sample by dividing it by its magnitude (norm). MinMaxScaler scales to a range, usually 0-1, with (x - min) / (max - min).',
  { ...SA1(5), verify: true });

add('sa1-06', 'co1', 'mc',
  'Before modeling, we handle missing values by imputing numeric features with the ____ PreProcessing Technique.',
  ['SimpleImputer', 'MinMaxScaler', 'OneHotEncoder', 'Normalizer'], 0,
  'Missing numeric values are filled in by imputation: SimpleImputer with strategy mean, median, or most_frequent.',
  { ...SA1(6), verify: true });

add('sa1-07', 'co1', 'mc',
  'Outliers should be addressed because they can distort the ____ and other statistics.',
  ['mean', 'output', 'labels', 'schema'], 0,
  'Outliers pull the mean (and other statistics) away from typical values, which can mislead a model.',
  { ...SA1(7), verify: true });

add('sa1-08', 'co1', 'mc',
  '____ is a data preprocessing method used to derive non-linear features by converting data into a polynomial of higher degree.',
  ['PolynomialFeatures', 'LabelEncoder', 'StandardScaler', 'SimpleImputer'], 0,
  'PolynomialFeatures creates non-linear features (x squared, x cubed, interactions) by raising the data to higher degrees.',
  { ...SA1(8), verify: true });

add('sa1-09', 'co1', 'mc',
  'We remove ____ to avoid counting the same observation twice.',
  ['duplicates', 'repetitions', 'outliers', 'missing values'], 0,
  "Duplicate rows are removed (df.drop_duplicates()) so no observation is counted twice. 'Repetitions' is not the term used.",
  { ...SA1(9), verify: true });

add('sa1-10', 'co1', 'mc',
  'Categorical features can be converted to numbers using ____.',
  ['OneHotEncoder', 'Normalizer', 'RobustScaler', 'SimpleImputer'], 0,
  'OneHotEncoder turns each category into its own 0/1 column. (LabelEncoder gives one unique integer per category.)', SA1(10));

add('sa1-11', 'co1', 'mc',
  'Data collection methods include ____, interviews, and questionnaires.',
  ['observation', 'imputation', 'scaling', 'deployment'], 0,
  'Observation, interviews, and questionnaires are data collection methods.', SA1(11));

add('sa1-12', 'co1', 'mc',
  'Primary data is data collected directly from the ____.',
  ['source', 'archive', 'internet', 'model'], 0,
  'Primary data is collected firsthand, directly from the source.', SA1(12));

add('sa1-13', 'co1', 'mc',
  'Primary data is data that is:',
  ['Copied from a published study', 'Obtained from secondary databases', 'Generated by random simulations', 'Collected directly from the source'], 3,
  'Primary data comes straight from the source. Published studies and secondary databases give secondary data.', SA1(13));

add('sa1-14', 'co1', 'mc',
  'A ____ is a graphical presentation of quantitative data using bars to show frequency.',
  ['histogram', 'line graph', 'scatter plot', 'heatmap'], 0,
  'A histogram uses bars to show frequency. A line graph shows trends, usually over time.', SA1(14));

add('sa1-15', 'co1', 'mc',
  "A box plot can be drawn directly from a pandas DataFrame using df.plot(kind='____').",
  ['box', 'bar', 'hist', 'line'], 0,
  "df.plot(kind='box') draws a box plot.", { ...SA1(15), code: true });

add('sa1-16', 'co1', 'mc',
  'To visualize a matrix of values or correlations as an image, seaborn provides the ____ function.',
  ['heatmap', 'skimage', 'boxplot', 'pairplot'], 0,
  'sns.heatmap(df.corr()) draws a correlation matrix as a colored image.', { ...SA1(16), code: true });

add('sa1-17', 'co1', 'mc',
  'To plot a time series with pandas, you can use the built-in plot method with the kind parameter set to ____.',
  ['line', 'box', 'pie', 'scatter'], 0,
  "kind='line' plots values over time.", { ...SA1(17), code: true });

add('sa1-18', 'co1', 'mc',
  "For a bar chart of a categorical variable, use value_counts().plot(kind='____').",
  ['bar', 'nominal', 'box', 'hist'], 0,
  "Count the categories with value_counts(), then plot with kind='bar'. 'nominal' is not a valid kind.", { ...SA1(18), code: true });

add('sa1-19', 'co1', 'mc',
  "To create a scatter plot that explores the relationship between two numeric variables, call df.plot(kind='____', x='A', y='B').",
  ['scatter', 'box', 'line', 'hist'], 0,
  "df.plot(kind='scatter', x='A', y='B') plots one numeric variable against another.", { ...SA1(19), code: true });

const SAMPLE =
  "raw_data = {\n  'Age': [25, 30, np.nan, 35, 40, 22, np.nan, 48],\n  'Salary': [50000, 60000, 52000, np.nan, 90000, 45000, 70000, 110000],\n  'Department': ['HR', 'IT', 'IT', 'HR', 'Finance', 'Finance', 'IT', 'HR'],\n  'Purchased': ['No', 'Yes', 'No', 'No', 'Yes', 'No', 'Yes', 'Yes']\n}";

card('sa1-20a', 'co1',
  `Given a sample dataset (with missing values, categories, and numerical data):\n\`\`\`\n${SAMPLE}\n\`\`\`\n1. Write a Python program to create a pie chart representing the distribution of employees across departments.\nExpected output: percentage of HR, IT, and Finance employees.`,
  "```\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame(raw_data)\ndf['Department'].value_counts().plot(kind='pie', autopct='%1.1f%%')\nplt.ylabel('')\nplt.show()\n```\nHR 37.5%, IT 37.5%, Finance 25%.",
  { ...SA1(20), code: true });

card('sa1-20b', 'co1',
  `Same dataset.\n2. Write a Python program to create a histogram of employee ages after handling missing values.\nGuide: replace missing ages with the mean age. Use 5 bins.`,
  "```\ndf = pd.DataFrame(raw_data)\ndf['Age'] = df['Age'].fillna(df['Age'].mean())\ndf['Age'].plot(kind='hist', bins=5)\nplt.xlabel('Age')\nplt.show()\n```\nThe mean of the six known ages is 200 / 6 = 33.33.",
  { ...SA1(20), code: true });

card('sa1-25', 'co1',
  `Same dataset. Write the correct code to implement the following:\n1. Create a dataframe df.\n2. Use imputation to replace missing values for Age.\n3. Use RobustScaler to normalize the Salary.\n4. Use LabelEncoder to convert Department into numerical values by assigning a unique integer to each category.`,
  "```\nimport pandas as pd\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import RobustScaler, LabelEncoder\n\n# 1\ndf = pd.DataFrame(raw_data)\n\n# 2\ndf['Age'] = SimpleImputer(strategy='mean').fit_transform(df[['Age']])\n\n# 3  (x - median) / IQR; NaN is ignored when fitting and stays NaN\ndf['Salary'] = RobustScaler().fit_transform(df[['Salary']])\n\n# 4  one unique integer per category: Finance=0, HR=1, IT=2\ndf['Department'] = LabelEncoder().fit_transform(df['Department'])\n```\nLabelEncoder gives one integer per category. The binary yes/no style columns belong to OneHotEncoder.",
  { ...SA1(25), code: true });

const STAGES = [
  'Define goals, constraints, and success metrics',
  'Gather relevant data from diverse sources',
  'Clean, transform, and organize data for analysis',
  'Assess model performance against metrics',
];
['Problem formulation', 'Data collection', 'Data preparation', 'Model evaluation'].forEach((stage, i) =>
  add(`sa1-26${'abcd'[i]}`, 'co1', 'mc',
    `Match the data science lifecycle stage with its primary activity.\n${stage}`,
    STAGES, i, `${stage}: ${STAGES[i].toLowerCase()}.`, SA1(26)));

add('sa1-21', 'co1', 'mc',
  'The data science lifecycle starts with understanding the problem, followed by data collection, preparation, analysis, modeling, evaluation, deployment, and then ____ of findings.',
  ['communication', 'collection', 'preparation', 'planning'], 0,
  'Lifecycle order: problem, collection, preparation, analysis, modeling, evaluation, deployment, then communication of findings.', SA1(21));

add('sa1-22', 'co1', 'mc',
  'Exploratory Data Analysis (EDA) helps identify ____ and relationships before modeling.',
  ['patterns', 'passwords', 'servers', 'deployments'], 0,
  'EDA reveals patterns and relationships in the data before you build a model.', SA1(22));

add('sa1-23', 'co1', 'tf',
  'The Data Science lifecycle ends with deployment and communication of results.',
  TF, 0, 'True. Deployment and communication of results are the final stages.', SA1(23));

add('sa1-24', 'co1', 'mc',
  'A typical Data Science lifecycle step is ____ models into production systems.',
  ['deploying', 'visualizing', 'encoding', 'scaling'], 0,
  'Models are deployed into production systems. Sharing results is the separate communication stage.', SA1(24));

/* =====================================================================
   CO2 · SA2  (EDA and feature selection)
   ===================================================================== */
const SA2 = (n) => ({ src: `SA2 Q${n}` });

add('sa2-01', 'co2', 'tf', 'Correlation indicates the strength of the relationship between variables.', TF, 0,
  'True. Correlation measures how strongly two variables are related.', SA2(1));
add('sa2-02', 'co2', 'tf', 'Duplicate records should be checked during data cleaning.', TF, 0,
  'True. Duplicates would count the same observation twice.', SA2(2));
add('sa2-03', 'co2', 'tf', 'EDA should be performed before building predictive models.', TF, 0,
  'True. EDA comes before modeling.', SA2(3));

add('sa2-04', 'co2', 'mc', 'Which method provides information about data types and missing values?',
  ['df.info()', 'df.sum()', 'df.shape()', 'df.mean()'], 0,
  'df.info() lists each column, its data type, and its non-null count.', SA2(4));
add('sa2-05', 'co2', 'mc', 'Which attribute returns the dimensions of a DataFrame?',
  ['df.columns', 'df.index', 'df.shape', 'df.values'], 2,
  'df.shape returns (rows, columns). It is an attribute, so no parentheses.', SA2(5));
add('sa2-06', 'co2', 'mc', 'What is the primary purpose of Exploratory Data Analysis (EDA)?',
  ['Deploy machine learning models', 'Explore and understand data before modeling', 'Build websites', 'Create databases'], 1,
  'EDA is about exploring and understanding the data before modeling.', SA2(6));
add('sa2-07', 'co2', 'mc', 'Which method identifies missing values in a dataset?',
  ['df.unique()', 'df.duplicated()', 'df.drop()', 'df.isnull()'], 3,
  'df.isnull() flags missing values. Chain .sum() to count them per column.', SA2(7));
add('sa2-08', 'co2', 'mc', 'Which function displays the first five rows of a dataset?',
  ['df.head()', 'df.info()', 'df.describe()', 'df.tail()'], 0,
  'df.head() shows the first five rows; df.tail() shows the last five.', SA2(8));
add('sa2-09', 'co2', 'mc', 'Which plot is commonly used to detect outliers?',
  ['Pie Chart', 'Heatmap', 'Scatter Matrix', 'Boxplot'], 3,
  'A boxplot marks values far outside the quartiles as outliers.', SA2(9));
add('sa2-10', 'co2', 'mc', 'What is an outlier?',
  ['A value significantly different from others', 'A duplicate value', 'A categorical variable', 'A missing value'], 0,
  'An outlier is a value significantly different from the others.', SA2(10));
add('sa2-11', 'co2', 'mc', 'Which library is commonly used for statistical visualization?',
  ['Django', 'Flask', 'TensorFlow', 'Seaborn'], 3,
  'Seaborn is built for statistical visualization. Django and Flask are web frameworks; TensorFlow is for machine learning.', SA2(11));

card('sa2-12', 'co2', 'Name two Python libraries frequently used in EDA.',
  'pandas and seaborn. (matplotlib and numpy are also common.)', SA2(12));
card('sa2-13', 'co2', 'What is the purpose of a correlation matrix?',
  "To visually show the relationship between the variables in a dataset (how strong it is, and whether they move together), so you can see which are related or independent of each other. It is often drawn as a heatmap.", SA2(13));
card('sa2-14', 'co2', 'Why is visualization important in EDA?',
  'So we can visually see and study the data, spot patterns, outliers and trends, and judge which features are best for the target model. EDA visualization uses boxplots, scatterplots, histograms and heatmaps for univariate, bivariate and multivariate analyses.', SA2(14));

add('sa2-15', 'co2', 'mc',
  'In the f_regression example for California housing, the F-values are array([1.85565716e+04, 2.32841479e+02, 4.87757462e+02, ...]). What does the feature with the F-value of 1.85565716e+04 imply about its relationship with the target variable?',
  ['It has a very strong linear relationship with the target.', 'Its p-value is likely very high.', 'It has a weak linear relationship with the target.', 'It has a strong non-linear relationship with the target.'], 0,
  'A very large F-value means a very strong linear relationship with the target and a very low p-value. f_regression only measures linear dependence.', SA2(15));

add('sa2-16', 'co2', 'mc',
  "After running chi2, pval = feature_selection.chi2(df.drop('Play',axis=1), df.Play), the chi2 values for the features 'Outlook', 'Temperature', 'Humidity', 'Wind' are array([2.02814815, 0.02222222, 1.4, 0.4]). Which feature shows the strongest dependency with the 'Play' target, based on these scores?",
  ['Humidity', 'Outlook', 'Temperature', 'Wind'], 1,
  'A higher chi2 score means a stronger dependency with the target. Outlook has the highest score (2.03).', SA2(16));

add('sa2-17', 'co2', 'mc',
  'Consider the synthetic data: y = X[:, 0] + np.sin(6 * np.pi * X[:, 1]) + 0.1 * np.random.randn(1000). If f_regression is applied, why might X[:, 1] receive a lower F-score compared to X[:, 0], despite being highly related to y?',
  ['X[:, 0] has a stronger overall correlation with y.', 'The noise component 0.1 * np.random.randn(1000) masks the relationship of X[:, 1].', 'f_regression is designed for classification tasks, not regression.', 'X[:, 1] has a non-linear relationship with y, which f_regression struggles to capture.'], 3,
  'f_regression measures linear dependence, so the sine relationship of X[:, 1] scores low even though it is strongly related to y.', SA2(17));

add('sa2-18', 'co2', 'mc',
  'Given the np.round(chi2) output for the breast cancer dataset as array([647., 118., 697., 573., 84., ...]), how would you interpret the feature corresponding to the value 697.?',
  ['It has a strong non-linear relationship with the target variable.', 'It is an irrelevant feature and should be removed.', 'Its F-value is lower than average, suggesting low importance.', 'It has a very strong linear relationship with the target variable.'], 3,
  'Of the values shown, 697 is the highest score, so that feature has the strongest dependency with the target (the course answer: a very strong linear relationship).', SA2(18));

add('sa2-19', 'co2', 'mc',
  "Using SelectKBest(k=7, score_func=feature_selection.f_classif) on the adult_data (after dropping 'Salary'), selector.scores_ shows feature scores. If the adult_data.columns are Index(['age', 'workclass', 'fnlwgt', 'education', 'education-num', 'marital-status', 'occupation', 'relationship', 'race', 'sex', 'capital-gain', 'capital-loss', 'hours-per-week', 'native-country']), and the scores (rounded for simplicity) are [1886, 86, 2, 206, 4120, 1346, 186, 2187, 168, 1593, 1709, 754, 1813, 8]. Which feature would likely be excluded if k=7?",
  ["'fnlwgt' (score 2)", "'relationship' (score 2187)", "'capital-gain' (score 1709)", "'education-num' (score 4120)"], 0,
  "SelectKBest keeps the 7 highest scores (4120, 2187, 1886, 1813, 1709, 1593, 1346). 'fnlwgt' (score 2) is far below that and is excluded.", SA2(19));

add('sa2-20', 'co2', 'mc',
  "Given the df after label encoding:\n```\n   A  B  C\n0  1  1  1\n1  0  2  2\n2  1  3  3\n3  1  1  1\n4  1  2  2\n5  1  1  1\n6  1  1  1\n7  1  1  1\n```\nAnd vt.variances_ output: array([0.109375, 0.5, 0.5]) If a VarianceThreshold selector is set with threshold=0.2, which columns will be retained after fit_transform?",
  ["'B', 'C'", "'A', 'B', 'C'", "'A', 'C'", "Only 'A'"], 0,
  'Columns with variance below the threshold are dropped. A (0.109) is below 0.2; B and C (0.5) stay.', SA2(20));

add('sa2-21', 'co2', 'mc',
  "If adult_data has 14 features (excluding 'Salary') and SelectPercentile(percentile=20, score_func=mutual_info_classif) is used, how many features will be selected?",
  ['7', '3', '14', '2'], 1,
  '20% of 14 features is 2.8, which rounds up to 3 features selected (the course answer).', SA2(21));

add('sa2-22', 'co2', 'mc', 'What type of feature selection technique is VarianceThreshold?',
  ['Supervised, univariate.', 'Unsupervised, multivariate.', 'Supervised, multivariate.', 'Unsupervised, univariate.'], 3,
  "VarianceThreshold never looks at the target (unsupervised) and judges each feature on its own variance (univariate).", SA2(22));

add('sa2-23', 'co2', 'mc', 'When is f_regression typically used for feature selection?',
  ['When both features and the target are categorical.', 'When both features and the target are continuous.', 'When features are continuous and the target is categorical.', 'When features are categorical and the target is continuous.'], 1,
  'f_regression is for regression problems, so both the features and the target are continuous. (f_classif is continuous features with a categorical target.)', SA2(23));

add('sa2-24', 'co2', 'mc', 'What is the primary function of SelectKBest?',
  ['To remove features with low variance.', 'To perform principal component analysis (PCA).', 'To select features based on their correlation with other features.', 'To select a fixed number (k) of the most important features based on a scoring function.'], 3,
  'SelectKBest keeps the k features with the highest scores from a scoring function.', SA2(24));

add('sa2-25', 'co2', 'mc', 'How does SelectPercentile differ from SelectKBest?',
  ['SelectPercentile is for regression tasks, while SelectKBest is for classification.', 'SelectPercentile uses a different set of scoring functions than SelectKBest.', 'SelectPercentile selects a fixed number of features, while SelectKBest selects a percentage.', 'SelectPercentile selects a percentage of the top-scoring features, while SelectKBest selects a fixed number.'], 3,
  'SelectPercentile keeps a percentage of the top-scoring features. SelectKBest keeps a fixed number (k).', SA2(25));

add('sa2-26', 'co2', 'mc', 'For which type of data combination is the Chi-squared test (chi2) typically used for feature selection?',
  ['Categorical features and categorical target.', 'Continuous features and continuous target.', 'Continuous features and categorical target.', 'Categorical features and continuous target.'], 0,
  'chi2 tests dependency between categorical features and a categorical target.', SA2(26));

add('sa2-27', 'co2', 'mc',
  "When using SelectKBest with score_func=feature_selection.f_classif on the adult_data (with 'Salary' as target), which of the following features, if present in the data, would be ranked highly for a classification task?",
  ['A feature with a high p-value, indicating a weak relationship with the target.', 'A feature that is highly correlated with other features but not with the target.', 'A feature with very low variance.', 'A feature with a high F-value, indicating strong linear dependency with the target.'], 3,
  'A high F-value (and low p-value) means a strong linear dependency with the target, so the feature ranks highly.', SA2(27));

add('sa2-28', 'co2', 'mc', 'What is the primary goal of feature selection in machine learning?',
  ['To preprocess categorical features into numerical ones.', 'To increase the dimensionality of the dataset.', 'To reduce model complexity and improve accuracy by removing irrelevant or redundant features.', 'To automatically generate new features from existing ones.'], 2,
  'Feature selection keeps the useful features and drops irrelevant or redundant ones.', SA2(28));

add('sa2-29', 'co2', 'mc', 'When using mutual_info_regression, which type of target variable is expected?',
  ['Binary', 'Continuous', 'Categorical', 'Discrete'], 1,
  'mutual_info_regression expects a continuous target.', SA2(29));

add('sa2-30', 'co2', 'mc', 'How does mutual_info_classif differ from mutual_info_regression in terms of target variable type?',
  ['Both handle only discrete targets.', 'mutual_info_classif handles discrete targets, while mutual_info_regression handles continuous targets.', 'Both handle only continuous targets.', 'mutual_info_classif handles continuous targets, while mutual_info_regression handles discrete targets.'], 1,
  'mutual_info_classif: discrete target. mutual_info_regression: continuous target.', SA2(30));

/* =====================================================================
   CO3 · reviewers
   ===================================================================== */
const SU = (n) => ({ src: `Sup and Unsup Q${n}` });
add('su-01', 'co3-sup', 'mc', 'Supervised learning requires:',
  ['Unlabeled data', 'Labeled data', 'Random data only', 'Clustered data'], 1,
  'Supervised learning trains on labeled data: inputs paired with the correct outputs.', SU(1));
add('su-02', 'co3-sup', 'mc', 'The main goal of a classification model is to:',
  ['Predict continuous values', 'Group similar data points', 'Assign data into categories', 'Remove noisy data'], 2,
  'Classification assigns data into categories. Predicting continuous values is regression; grouping is clustering.', SU(2));
add('su-03', 'co3-sup', 'mc', 'Which machine learning task predicts house prices?',
  ['Clustering', 'Association Rule Mining', 'Regression', 'Dimensionality Reduction'], 2,
  'Predicting a continuous number such as a price is regression.', SU(3));
add('su-04', 'co3-sup', 'mc', 'Which metric is commonly used in classification problems?',
  ['Mean Squared Error', 'Accuracy', 'Sum of Squares', 'Variance'], 1,
  'Accuracy is a standard classification metric. Mean Squared Error is a regression metric.', SU(4));
add('su-05', 'co3-sup', 'mc', 'What is a feature in machine learning?',
  ['Output variable', 'Data label', 'Input variable used for prediction', 'Prediction result'], 2,
  'A feature is an input variable. The label (target) is the output the model learns to predict.', SU(5));
add('su-06', 'co3-sup', 'mc', 'Unsupervised learning works with:',
  ['Labeled data', 'Unlabeled data', 'Only numeric targets', 'Predicted probabilities'], 1,
  'Unsupervised learning finds structure (clusters, associations) in unlabeled data.',
  { src: 'Similar to Sup and Unsup Q6 (that question was not visible in the PDF)', verify: true });

const AP = (n) => ({ src: `Application Q${n}` });
add('app-01', 'co3-app', 'mc',
  'A data point has coordinates (4,5). Two cluster centroids are:\n- Cluster A: (2,3)\n- Cluster B: (7,9)\nUsing Euclidean distance, to which cluster should the point be assigned?',
  ['Cluster A', 'Cluster B', 'Both clusters', 'Cannot be determined'], 0,
  'Distance to A = sqrt(2^2 + 2^2) = sqrt(8), about 2.83. Distance to B = sqrt(3^2 + 4^2) = 5. A is closer.', AP(1));
add('app-02', 'co3-app', 'mc',
  'A decision tree classifies loan applicants using the following rule:\n- If Income > ₱40,000 → Approve\n- Otherwise → Reject\nAn applicant has an income of ₱55,000. What is the predicted decision?',
  ['Reject', 'Approve', 'Review Manually', 'Insufficient Data'], 1,
  '55,000 is greater than 40,000, so the first rule applies: Approve.', AP(2));
add('app-03', 'co3-app', 'mc',
  'The linear regression equation for predicting sales is:\nSales = 100 + 15(Advertising)\nIf advertising expenditure increases from 10 units to 12 units, by how much will the predicted sales increase?',
  ['15', '25', '30', '45'], 2,
  'Increase = slope x change in x = 15 x (12 - 10) = 30. The intercept (100) cancels out.', AP(3));
add('app-04', 'co3-app', 'mc',
  'A logistic regression model predicts a probability of 0.76 that a customer will purchase a product. Using a classification threshold of 0.50, the customer will be classified as:',
  ['No Purchase', 'Purchase', 'Uncertain', 'Outlier'], 1,
  '0.76 is above the 0.50 threshold, so the customer is classified as Purchase.', AP(4));
add('app-05', 'co3-app', 'mc',
  'Using the Elbow Method, the graph shows a sharp decrease in WCSS until K = 4 and then levels off. What is the best value of K?',
  ['2', '3', '4', '10'], 2,
  'The elbow is where the drop in WCSS levels off: K = 4.', AP(5));

const DT = (n) => ({ src: `Decision Tree Analysis Q${n}` });
add('dt-01', 'co3-tree', 'mc', 'Decision Trees are used for:',
  ['Classification and Regression', 'Clustering only', 'Visualization only', 'Feature Scaling'], 0,
  'Decision trees handle both classification and regression.', DT(1));
add('dt-02', 'co3-tree', 'mc', 'The top node of a Decision Tree is called:',
  ['Leaf Node', 'Root Node', 'Child Node', 'Split Node'], 1,
  'The top node is the root node.', DT(2));
add('dt-03', 'co3-tree', 'mc', 'The final nodes in a Decision Tree are called:',
  ['Branches', 'Roots', 'Leaves', 'Features'], 2,
  'The final nodes, which hold the decision or prediction, are leaves.', DT(3));
add('dt-04', 'co3-tree', 'mc', 'Decision Trees split data based on:',
  ['Decision rules', 'Clusters', 'Distances only', 'Random labels'], 0,
  'Each split applies a decision rule on a feature.', DT(4));
add('dt-05', 'co3-tree', 'mc', 'Which metric is commonly used for classification trees?',
  ['Gini Index', 'Variance Inflation Factor', 'Mean Absolute Error', 'Euclidean Distance'], 0,
  'The Gini Index (or entropy) measures how pure a split is in classification trees.', DT(5));
add('dt-06', 'co3-tree', 'mc', 'A Decision Tree can easily handle:',
  ['Numerical data only', 'Categorical data only', 'Both numerical and categorical data', 'Images only'], 2,
  'Trees can split on numeric thresholds and on categories.', DT(6));
add('dt-07', 'co3-tree', 'mc', 'Pruning is used to:',
  ['Add branches', 'Prevent overfitting', 'Increase tree depth', 'Remove records'], 1,
  'Pruning removes branches that fit noise, so the tree generalizes better.', DT(7));
add('dt-08', 'co3-tree', 'mc', 'Which is an advantage of Decision Trees?',
  ['Easy interpretation', 'Requires large computing power', 'Difficult visualization', 'Cannot classify data'], 0,
  'Trees are easy to read and explain because they follow simple rules.', DT(8));
add('dt-09', 'co3-tree', 'mc', 'Decision Trees are most commonly associated with:',
  ['Rule-based learning', 'Clustering', 'Neural computation', 'Bayesian estimation'], 0,
  'A tree is a set of if-then rules, so it is rule-based learning.', DT(9));
add('dt-10', 'co3-tree', 'mc', 'Besides the Gini Index, which measure can be used to choose splits in a decision tree?',
  ['Entropy (information gain)', 'Euclidean distance', 'Silhouette score', 'WCSS'], 0,
  'Entropy and information gain are the other common split criteria.',
  { src: 'Similar to Decision Tree Analysis Q10 (not visible in the PDF)', verify: true });
add('dt-11', 'co3-tree', 'mc', 'A tree that fits the training data too closely and performs poorly on new data is:',
  ['Overfitted', 'Pruned', 'Underfitted', 'Normalized'], 0,
  'That is overfitting. Pruning is one way to reduce it.',
  { src: 'Similar to Decision Tree Analysis Q11 (not visible in the PDF)', verify: true });

const KM = (n) => ({ src: `K-Means Q${n}` });
add('km-01', 'co3-kmeans', 'mc', 'K-Means is primarily used for:',
  ['Classification', 'Regression', 'Clustering', 'Forecasting'], 2,
  'K-Means is an unsupervised clustering algorithm.', KM(1));
add('km-02', 'co3-kmeans', 'mc', 'K in K-Means represents:',
  ['Number of features', 'Number of records', 'Number of clusters', 'Number of labels'], 2,
  'K is the number of clusters you ask the algorithm to find.', KM(2));
add('km-03', 'co3-kmeans', 'mc', 'What is the center of a cluster called?',
  ['Mean Point', 'Node', 'Centroid', 'Branch'], 2,
  'The center of a cluster is its centroid.', KM(3));
add('km-04', 'co3-kmeans', 'mc', 'The objective of K-Means is to:',
  ['Maximize cluster distance within clusters', 'Minimize distance within clusters', 'Increase classification accuracy', 'Reduce labels'], 1,
  'K-Means makes points close to their own centroid, which minimizes the distance within clusters.', KM(4));
add('km-05', 'co3-kmeans', 'mc', 'Which measure is commonly used to assign data points to clusters?',
  ['Manhattan Distance only', 'Euclidean Distance', 'Correlation', 'Entropy'], 1,
  'Each point goes to the nearest centroid, measured by Euclidean distance. Entropy belongs to decision trees.', KM(5));
add('km-06', 'co3-kmeans', 'mc', 'Which method helps determine the optimal number of clusters?',
  ['Train-Test Split', 'Cross Validation', 'Elbow Method', 'Bootstrap'], 2,
  'The Elbow Method plots WCSS against K and picks the K where the drop levels off.', KM(6));
add('km-07', 'co3-kmeans', 'mc', 'K-Means works best when clusters are:',
  ['Arbitrary shaped', 'Spherical and well separated', 'Overlapping completely', 'Unknown'], 1,
  'K-Means assumes roughly round clusters with clear gaps between them.', KM(7));
add('km-08', 'co3-kmeans', 'mc', 'K-Means is a(n) ____ learning algorithm.',
  ['unsupervised', 'supervised', 'rule-based', 'regression'], 0,
  'It works on unlabeled data, so it is unsupervised.',
  { src: 'Similar to K-Means Q8 (not visible in the PDF)', verify: true });
add('km-09', 'co3-kmeans', 'mc', 'In the Elbow Method, what does WCSS stand for?',
  ['Within-Cluster Sum of Squares', 'Weighted Class Sum of Scores', 'Within-Class Standard Score', 'Whole-Cluster Sample Size'], 0,
  'WCSS = within-cluster sum of squares: the total squared distance from points to their centroid.',
  { src: 'Similar to K-Means Q9 (not visible in the PDF)', verify: true });

/* =====================================================================
   Case study · Group 9 deck: ML-powered financial credit scoring
   ===================================================================== */
const CS = (n) => ({ src: `Group 9 deck, slide ${n}` });

card('cs-c01', 'case', 'Which article is the case study based on?',
  "Ayari, Guetari & Kraïem (2026), 'Machine learning powered financial credit scoring: a systematic literature review', Artificial Intelligence Review, 59(13).", CS(1));
card('cs-c02', 'case', 'The article at a glance: how many studies, records, libraries and research questions? What years were covered?',
  '63 studies in the final synthesis, 345 records first identified, 4 digital libraries searched, 5 research questions. Studies published 2018-2024. As a review, it built no model of its own, so the lifecycle applies to the review process and to the models it analyzes.', CS(2));
card('cs-c03', 'case', 'Name the seven phases of the data science lifecycle used in the deck.',
  '01 Discovery, 02 Data Preparation, 03 Model Planning, 04 Model Building, 05 Model Evaluation, 06 Communicate Results, 07 Operationalize.', CS(3));
card('cs-c04', 'case', 'Phase 01 Discovery: what is the gap, the problem, and the context?',
  'Gap: traditional scorecards are interpretable but rely on narrow features and linear assumptions. Problem: ML handles non-linear, high-dimensional and alternative data, yet studies use different datasets, preprocessing and metrics, so results are hard to compare. Context: lenders must decide fast and meet IFRS 9 (PD, EAD, LGD).', CS(4));
card('cs-c05', 'case', 'What are the five research questions (RQ1 to RQ5)?',
  'RQ1 Most widely used ML models. RQ2 Their strengths and limitations. RQ3 Metrics used to evaluate them. RQ4 Emerging trends and advances. RQ5 Challenges to adoption.', CS(4));
card('cs-c06', 'case', 'Phase 02 Data Preparation: describe the flow from 345 records to 63 studies.',
  'Identified 345 (330 from databases + 15 other sources) → screened 283 after duplicates were removed → full-text assessed 113 for eligibility → included 63 in the final synthesis.', CS(5));
card('cs-c07', 'case', 'Which libraries were searched, and for what period?',
  'Boolean search of SpringerLink, ACM DL, IEEE Xplore and Google Scholar, January 2018 to December 2024.', CS(5));
card('cs-c08', 'case', 'What were the inclusion rules and what was excluded?',
  'Included: English, peer-reviewed, empirical, 2018-2024. Excluded: duplicates, papers under 4 pages, and studies without clear metrics.', CS(6));
card('cs-c09', 'case', 'How was study quality checked, and how was evidence organized?',
  'Quality score: five yes / partly / no questions per study; every included study scored at least 77%. An Excel extraction form logged each study\'s technique, dataset and metrics, then grouped the studies into ML, DL and EL.', CS(6));
card('cs-c10', 'case', 'Which datasets were most used in the reviewed studies?',
  'The public German, Australian and Japanese credit datasets. About one-third of studies used proprietary bank data.', CS(6));
card('cs-c11', 'case', 'Phase 03 Model Planning: what four model families were identified, with examples?',
  'Traditional ML (Logistic Regression, Decision Trees, Random Forest, SVM, KNN). Deep Learning (ANN, CNN, LSTM). Ensemble Learning (GBDT, XGBoost). Hybrid Models (stacking ensembles, GA-optimized neural networks).', CS(7));
card('cs-c12', 'case', 'How was the review itself planned, and which synthesis tools were used?',
  'Planned in advance around PRISMA 2020 and the five RQs. Synthesis tools: comparison tables, bibliographic coupling, and keyword and citation analysis.', CS(7));
card('cs-c13', 'case', 'Phase 04 Model Building: how were the reviewed logistic regression and XGBoost models built?',
  'The review trained no model of its own; it documents how studies built theirs. Logistic regression: fitted by Newton-Raphson or gradient descent, tested with 5-fold validation (Cao et al., 2021). XGBoost: adds trees one by one, each fixing the last one\'s errors, tuned by Bayesian optimization (Yotsawat et al., 2021).', CS(8));
card('cs-c14', 'case', 'Phase 04 Model Building: how were the deep learning and stacking models built?',
  'Deep learning: tabular data turned into images for a 2D CNN (Dastile & Celik, 2021); LSTM tuned by a genetic algorithm (Adisa et al., 2022). Stacking pipeline: SMOTE oversampling → RF, SVM and Extra Trees → XGBoost meta-learner (Rofik et al., 2024).', CS(8));
card('cs-c15', 'case', 'Phase 05 Model Evaluation: which metrics did the studies use, and how many studies used each?',
  'Accuracy 49, AUC 31, F1-score 25, Recall 24, Specificity 14, KS statistic 13, Precision 13.', CS(9));
card('cs-c16', 'case', 'Why can accuracy mislead in credit scoring?',
  'Defaults are rare, so the data is imbalanced. AUC, F1, G-mean and KS give a fairer view. Combine several metrics.', CS(9));
card('cs-c17', 'case', 'What were the top results on the benchmark datasets?',
  'Australian: 96.65% AUC, 92.36% accuracy (multi-stage ensemble, Zhang et al., 2021). Japanese: 96.95% AUC, 93.16% accuracy (multi-stage ensemble, Zhang et al., 2021). Lending Club: 93.78% AUC, 91.70% accuracy (GSCI ensemble, Chen et al., 2020). Most ML, DL and EL methods exceed 80% accuracy; hybrid and ensemble models lead.', CS(10));
card('cs-c18', 'case', 'How were the models validated, and was there a formal cross-study ranking?',
  'k-fold, cross-validation and out-of-time tests inside the studies. There was no formal cross-study ranking.', CS(10));
card('cs-c19', 'case', 'Give the strength and limitation of each model family: Traditional ML, Deep learning, Ensemble, Hybrid.',
  'Traditional ML: small datasets, easy to interpret / needs good labeled data, LR assumes linearity. Deep learning: large, high-dimensional, non-linear data / black box, data-hungry, bias on imbalanced data. Ensemble: lower bias and variance, higher accuracy and AUC / less interpretable than single models. Hybrid: most accurate and robust, adaptable / complex to build and tune, heavy compute, overfitting risk.', CS(11));
card('cs-c20', 'case', 'Phase 06 Communicate Results: what is the key finding?',
  'Hybrid and ensemble models predict best, but cost more in interpretability and compute. Use them where accuracy matters and data is sufficient, while keeping enough transparency for regulators.', CS(12));
card('cs-c21', 'case', 'What emerging trends and recommendations does the deck give?',
  'Alternative data (social media, mobile, psychometric) helps thin-file borrowers but needs privacy and fairness safeguards. Explainability: LIME and SHAP can bring black-box models close to scorecard-level interpretability. Practitioners: pick ensemble or hybrid models when accuracy is critical, balanced with interpretability. Researchers: standard benchmarks, privacy-safe alternative data, bias-aware models, scalable solutions.', CS(13));
card('cs-c22', 'case', 'Phase 07 Operationalize: what is the intended use of the review?',
  'It has no deployment of its own: it is a review. It guides model selection for researchers, practitioners and institutions. Deployment-ready examples: OICSM (online updates) and SurvXGBoost (time-to-default). Tied to IFRS 9: PD, EAD, LGD.', CS(14));
card('cs-c23', 'case', 'What are the five adoption challenges?',
  'Computational cost (complex models may be prohibitive for small institutions). Interpretability (LIME and SHAP can be inconsistent and attackable). Bias and fairness (mitigate with pre-, in- and post-processing). High dimensionality (overfitting and memory cost; needs feature selection). Behavioral data (willingness to repay is hard to measure).', CS(14));

add('cs-01', 'case', 'mc', 'How many studies were included in the final synthesis of the review?',
  ['345', '283', '113', '63'], 3, 'The funnel ends at 63 studies.', CS(5));
add('cs-02', 'case', 'mc', 'How many records remained for screening after duplicates were removed?',
  ['330', '283', '113', '63'], 1, '345 identified → 283 screened after removing duplicates.', CS(5));
add('cs-03', 'case', 'mc', 'How many full-text articles were assessed for eligibility?',
  ['63', '113', '283', '345'], 1, '113 full texts were assessed; 63 were included.', CS(5));
add('cs-04', 'case', 'mc', 'Which lifecycle phase covers search, PRISMA filtering and extraction?',
  ['Discovery', 'Data Preparation', 'Model Planning', 'Operationalize'], 1, 'Phase 02, Data Preparation.', CS(5));
add('cs-05', 'case', 'mc', 'Which four model families did the review identify?',
  ['Traditional ML, Deep Learning, Ensemble Learning, Hybrid Models', 'Regression, Clustering, Association, Dimensionality Reduction', 'Supervised, Unsupervised, Semi-supervised, Reinforcement', 'Linear, Logistic, Tree, Neural'], 0,
  'Traditional ML, Deep Learning, Ensemble Learning and Hybrid Models.', CS(7));
add('cs-06', 'case', 'mc', 'Which evaluation metric was used by the most studies (49)?',
  ['Accuracy', 'AUC', 'F1-score', 'Recall'], 0, 'Accuracy 49, AUC 31, F1 25, Recall 24.', CS(9));
add('cs-07', 'case', 'mc', 'Why can accuracy mislead in credit scoring?',
  ['Defaults are rare, so the data is imbalanced', 'Accuracy only works on regression problems', 'Credit data has no labels', 'Accuracy cannot be computed for classifiers'], 0,
  'Because defaults are rare, a model can look accurate while missing the defaults. AUC, F1, G-mean and KS give a fairer view.', CS(9));
add('cs-08', 'case', 'mc', 'Which models predict best, but cost more in interpretability and compute?',
  ['Hybrid and ensemble models', 'Traditional scorecards', 'Logistic regression only', 'Single decision trees'], 0,
  'Hybrid and ensemble models predict best but are less interpretable and heavier to run.', CS(12));
add('cs-09', 'case', 'mc', 'Which methods can bring black-box models close to scorecard-level interpretability?',
  ['LIME and SHAP', 'PRISMA and IFRS 9', 'SMOTE and XGBoost', 'Gini and entropy'], 0,
  'LIME and SHAP explain black-box predictions.', CS(13));
add('cs-10', 'case', 'mc', 'Which pipeline did Rofik et al. (2024) use in the stacking example?',
  ['SMOTE oversampling → RF, SVM and Extra Trees → XGBoost meta-learner', 'Bayesian optimization → single decision tree → k-means', 'Newton-Raphson → logistic regression → 5-fold validation', 'Tabular data to images → 2D CNN → LSTM'], 0,
  'SMOTE oversampling feeds RF, SVM and Extra Trees, with an XGBoost meta-learner on top.', CS(8));
add('cs-11', 'case', 'mc', 'Which framework are PD, EAD and LGD tied to in the deck?',
  ['IFRS 9', 'PRISMA 2020', 'LIME', 'k-fold validation'], 0,
  'Lenders must meet IFRS 9 (probability of default, exposure at default, loss given default).', CS(4));
add('cs-12', 'case', 'mc', 'What was every included study required to score on the quality check?',
  ['At least 50%', 'At least 60%', 'At least 77%', 'At least 90%'], 2,
  'Five yes / partly / no questions per study; every included study scored at least 77%.', CS(6));
add('cs-13', 'case', 'mc', 'Which benchmark dataset had the top AUC of 96.95%?',
  ['Australian', 'Japanese', 'Lending Club', 'German'], 1,
  'Japanese: 96.95% AUC, 93.16% accuracy (multi-stage ensemble, Zhang et al., 2021).', CS(10));
add('cs-14', 'case', 'mc', "What is the review's relationship to model deployment?",
  ['It deployed no model of its own; it guides model selection', 'It deployed an XGBoost model at a bank', 'It deployed an LSTM for online updates', 'It deployed OICSM and SurvXGBoost itself'], 0,
  'It is a review: no deployment of its own. OICSM and SurvXGBoost are examples of deployment-ready models from the literature.', CS(14));

/* ---------------------------------------------------------------------
   Validate and write
   --------------------------------------------------------------------- */
const ids = new Set();
Q.forEach((q, i) => {
  if (ids.has(q.id)) throw new Error('duplicate id ' + q.id);
  ids.add(q.id);
  q.position = i + 1;
  if (q.kind === 'card') {
    if (q.options.length || q.answer !== null) throw new Error('bad card ' + q.id);
  } else {
    if (q.options.length < 2) throw new Error('too few options ' + q.id);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) throw new Error('bad answer ' + q.id);
    if (q.kind === 'tf' && (q.options.length !== 2 || q.options[0] !== 'True')) throw new Error('bad tf ' + q.id);
  }
});

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(here, '..', 'data', 'questions.json'), JSON.stringify(Q, null, 1) + '\n');

const count = {};
Q.forEach((q) => { const k = q.topic + (q.kind === 'card' ? ' (cards)' : ''); count[k] = (count[k] || 0) + 1; });
console.log(Q.length, 'items written');
console.log(count);
console.log('flagged verify:', Q.filter((q) => q.verify).map((q) => q.id).join(', '));
