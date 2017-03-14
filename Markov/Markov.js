/*
 Markov a simple name generator that uses Markov chains.
 Usage: In the chat enter !markov [language set name]

  This script is derived from name_generator.js
  Re-formatted and implemented in Roll20 by Ryan Jentzsch
  name_generator.js was written and released to the public domain by drow <drow@bin.sh>
  http://creativecommons.org/publicdomain/zero/1.0/
  original source from https://donjon.bin.sh/code/name/
  Many thanks to the original author
 */

/* jshint undef: true */
/* globals
 globalconfig,
 useroptions,
 findObjs,
 sendChat,
 state,
 log,
 on,
 _
 */

/**
 * Markov pseudo-class
 *
 * @type {{chain_cache: {}, namesets: {default: string[]}, init: markov.init, handleChatMessage: markov.handleChatMessage, generateName: markov.generateName, markov_chain: markov.markov_chain, construct_chain: markov.construct_chain, incr_chain: markov.incr_chain, scale_chain: markov.scale_chain, markov_name: markov.markov_name, select_link: markov.select_link}}
 */
var markov =
{
	/**
	 * Helper function to transform a string into an array with a given separator
	 *
	 * @param fullString - the string to convert
	 * @param separator - what separates each word or element (e.g. "," to use the comma as a deliminator)
	 * @return {Array}
	 */
	listToArray: function(fullString, separator)
	{
		'use strict';

		var fullArray = [];
		if (fullString !== undefined)
		{
			if (fullString.indexOf(separator) === -1)
			{
				fullArray.push(fullString);
			}
			else
			{
				fullArray = fullString.split(separator);
			}
		}
		return fullArray;
	},

	/**
	 * Default names seed for markov to generate new names from
	 *
	 * @type {string[]}
	 */
	defaultNames:
		[
			"Aaron", "Aaron", "Abbey", "Abbie", "Abby", "Abdul", "Abe", "Abel", "Abigail", "Abraham", "Abram", "Ada", "Adah", "Adalberto", "Adaline", "Adam",
			"Adam", "Adan", "Addie", "Adela", "Adelaida", "Adelaide", "Adele", "Adelia", "Adelina", "Adeline", "Adell", "Adella", "Adelle", "Adena", "Adina",
			"Adolfo", "Adolph", "Adria", "Adrian", "Adrian", "Adriana", "Adriane", "Adrianna", "Adrianne", "Adrien", "Adriene", "Adrienne", "Afton", "Agatha",
			"Agnes", "Agnus", "Agripina", "Agueda", "Agustin", "Agustina", "Ahmad", "Ahmed", "Ai", "Aida", "Aide", "Aiko", "Aileen", "Ailene", "Aimee", "Aisha",
			"Aja", "Akiko", "Akilah", "Al", "Alaina", "Alaine", "Alan", "Alana", "Alane", "Alanna", "Alayna", "Alba", "Albert", "Albert", "Alberta", "Albertha",
			"Albertina", "Albertine", "Alberto", "Albina", "Alda", "Alden", "Aldo", "Alease", "Alec", "Alecia", "Aleen", "Aleida", "Aleisha", "Alejandra",
			"Alejandrina", "Alejandro", "Alena", "Alene", "Alesha", "Aleshia", "Alesia", "Alessandra", "Aleta", "Aletha", "Alethea", "Alethia", "Alex", "Alex",
			"Alexa", "Alexander", "Alexander", "Alexandra", "Alexandria", "Alexia", "Alexis", "Alexis", "Alfonso", "Alfonzo", "Alfred", "Alfreda", "Alfredia",
			"Alfredo", "Ali", "Ali", "Alia", "Alica", "Alice", "Alicia", "Alida", "Alina", "Aline", "Alisa", "Alise", "Alisha", "Alishia", "Alisia", "Alison",
			"Alissa", "Alita", "Alix", "Aliza", "Alla", "Allan", "Alleen", "Allegra", "Allen", "Allen", "Allena", "Allene", "Allie", "Alline", "Allison", "Allyn",
			"Allyson", "Alma", "Almeda", "Almeta", "Alona", "Alonso", "Alonzo", "Alpha", "Alphonse", "Alphonso", "Alta", "Altagracia", "Altha", "Althea", "Alton",
			"Alva", "Alva", "Alvaro", "Alvera", "Alverta", "Alvin", "Alvina", "Alyce", "Alycia", "Alysa", "Alyse", "Alysha", "Alysia", "Alyson", "Alyssa", "Amada",
			"Amado", "Amal", "Amalia", "Amanda", "Amber", "Amberly", "Ambrose", "Amee", "Amelia", "America", "Ami", "Amie", "Amiee", "Amina", "Amira", "Ammie",
			"Amos", "Amparo", "Amy", "An", "Ana", "Anabel", "Analisa", "Anamaria", "Anastacia", "Anastasia", "Andera", "Anderson", "Andra", "Andre", "Andre",
			"Andrea", "Andrea", "Andreas", "Andree", "Andres", "Andrew", "Andrew", "Andria", "Andy", "Anette", "Angel", "Angel", "Angela", "Angele", "Angelena",
			"Angeles", "Angelia", "Angelic", "Angelica", "Angelika", "Angelina", "Angeline", "Angelique", "Angelita", "Angella", "Angelo", "Angelo", "Angelyn",
			"Angie", "Angila", "Angla", "Angle", "Anglea", "Anh", "Anibal", "Anika", "Anisa", "Anisha", "Anissa", "Anita", "Anitra", "Anja", "Anjanette", "Anjelica",
			"Ann", "Anna", "Annabel", "Annabell", "Annabelle", "Annalee", "Annalisa", "Annamae", "Annamaria", "Annamarie", "Anne", "Anneliese", "Annelle", "Annemarie",
			"Annett", "Annetta", "Annette", "Annice", "Annie", "Annika", "Annis", "Annita", "Annmarie", "Anthony", "Anthony", "Antione", "Antionette", "Antoine",
			"Antoinette", "Anton", "Antone", "Antonetta", "Antonette", "Antonia", "Antonia", "Antonietta", "Antonina", "Antonio", "Antonio", "Antony", "Antwan",
			"Anya", "Apolonia", "April", "Apryl", "Ara", "Araceli", "Aracelis", "Aracely", "Arcelia", "Archie", "Ardath", "Ardelia", "Ardell", "Ardella", "Ardelle",
			"Arden", "Ardis", "Ardith", "Aretha", "Argelia", "Argentina", "Ariana", "Ariane", "Arianna", "Arianne", "Arica", "Arie", "Ariel", "Ariel", "Arielle",
			"Arla", "Arlean", "Arleen", "Arlen", "Arlena", "Arlene", "Arletha", "Arletta", "Arlette", "Arlie", "Arlinda", "Arline", "Arlyne", "Armand", "Armanda",
			"Armandina", "Armando", "Armida", "Arminda", "Arnetta", "Arnette", "Arnita", "Arnold", "Arnoldo", "Arnulfo", "Aron", "Arron", "Art", "Arthur", "Arthur",
			"Artie", "Arturo", "Arvilla", "Asa", "Asha", "Ashanti", "Ashely", "Ashlea", "Ashlee", "Ashleigh", "Ashley", "Ashley", "Ashli", "Ashlie", "Ashly", "Ashlyn",
			"Ashton", "Asia", "Asley", "Assunta", "Astrid", "Asuncion", "Athena", "Aubrey", "Aubrey", "Audie", "Audra", "Audrea", "Audrey", "Audria", "Audrie", "Audry",
			"August", "Augusta", "Augustina", "Augustine", "Augustine", "Augustus", "Aundrea", "Aura", "Aurea", "Aurelia", "Aurelio", "Aurora", "Aurore", "Austin",
			"Austin", "Autumn", "Ava", "Avelina", "Avery", "Avery", "Avis", "Avril", "Awilda", "Ayako", "Ayana", "Ayanna", "Ayesha", "Azalee", "Azucena", "Azzie", "Babara",
			"Babette", "Bailey", "Bambi", "Bao", "Barabara", "Barb", "Barbar", "Barbara", "Barbera", "Barbie", "Barbra", "Bari", "Barney", "Barrett", "Barrie", "Barry", "Bart",
			"Barton", "Basil", "Basilia", "Bea", "Beata", "Beatrice", "Beatris", "Beatriz", "Beau", "Beaulah", "Bebe", "Becki", "Beckie", "Becky",
			"Bee", "Belen", "Belia", "Belinda", "Belkis", "Bell", "Bella", "Belle", "Belva", "Ben", "Benedict", "Benita", "Benito", "Benjamin", "Bennett", "Bennie",
			"Bennie", "Benny", "Benton", "Berenice", "Berna", "Bernadette", "Bernadine", "Bernard", "Bernarda", "Bernardina", "Bernardine", "Bernardo", "Berneice", "Bernetta", "Bernice",
			"Bernie", "Bernie", "Berniece", "Bernita", "Berry", "Berry", "Bert", "Berta", "Bertha", "Bertie", "Bertram", "Beryl", "Bess", "Bessie", "Beth",
			"Bethanie", "Bethann", "Bethany", "Bethel", "Betsey", "Betsy", "Bette", "Bettie", "Bettina", "Betty", "Bettyann", "Bettye", "Beula", "Beulah", "Bev",
			"Beverlee", "Beverley", "Beverly", "Bianca", "Bibi", "Bill", "Billi", "Billie", "Billie", "Billy", "Billy", "Billye", "Birdie", "Birgit", "Blaine",
			"Blair", "Blair", "Blake", "Blake", "Blanca", "Blanch", "Blanche", "Blondell", "Blossom", "Blythe", "Bo", "Bob", "Bobbi", "Bobbie", "Bobbie",
			"Bobby", "Bobby", "Bobbye", "Bobette", "Bok", "Bong", "Bonita", "Bonnie", "Bonny", "Booker", "Boris", "Boyce", "Boyd", "Brad", "Bradford",
			"Bradley", "Bradly", "Brady", "Brain", "Branda", "Brande", "Brandee", "Branden", "Brandi", "Brandie", "Brandon", "Brandon", "Brandy", "Brant", "Breana",
			"Breann", "Breanna", "Breanne", "Bree", "Brenda", "Brendan", "Brendon", "Brenna", "Brent", "Brenton", "Bret", "Brett", "Brett", "Brian", "Brian",
			"Briana", "Brianna", "Brianne", "Brice", "Bridget", "Bridgett", "Bridgette", "Brigette", "Brigid", "Brigida", "Brigitte", "Brinda", "Britany", "Britney", "Britni",
			"Britt", "Britt", "Britta", "Brittaney", "Brittani", "Brittanie", "Brittany", "Britteny", "Brittney", "Brittni", "Brittny", "Brock", "Broderick", "Bronwyn", "Brook",
			"Brooke", "Brooks", "Bruce", "Bruna", "Brunilda", "Bruno", "Bryan", "Bryanna", "Bryant", "Bryce", "Brynn", "Bryon", "Buck", "Bud", "Buddy",
			"Buena", "Buffy", "Buford", "Bula", "Bulah", "Bunny", "Burl", "Burma", "Burt", "Burton", "Buster", "Byron", "Caitlin", "Caitlyn", "Calandra",
			"Caleb", "Calista", "Callie", "Calvin", "Camelia", "Camellia", "Cameron", "Cameron", "Cami", "Camie", "Camila", "Camilla", "Camille", "Cammie", "Cammy",
			"Candace", "Candance", "Candelaria", "Candi", "Candice", "Candida", "Candie", "Candis", "Candra", "Candy", "Candyce", "Caprice", "Cara", "Caren", "Carey",
			"Carey", "Cari", "Caridad", "Carie", "Carin", "Carina", "Carisa", "Carissa", "Carita", "Carl", "Carl", "Carla", "Carlee", "Carleen", "Carlena",
			"Carlene", "Carletta", "Carley", "Carli", "Carlie", "Carline", "Carlita", "Carlo", "Carlos", "Carlos", "Carlota", "Carlotta", "Carlton", "Carly", "Carlyn",
			"Carma", "Carman", "Carmel", "Carmela", "Carmelia", "Carmelina", "Carmelita", "Carmella", "Carmelo", "Carmen", "Carmen", "Carmina", "Carmine", "Carmon", "Carol",
			"Carol", "Carola", "Carolann", "Carole", "Carolee", "Carolin", "Carolina", "Caroline", "Caroll", "Carolyn", "Carolyne", "Carolynn", "Caron", "Caroyln", "Carri",
			"Carrie", "Carrol", "Carrol", "Carroll", "Carroll", "Carry", "Carson", "Carter", "Cary", "Cary", "Caryl", "Carylon", "Caryn", "Casandra", "Casey",
			"Casey", "Casie", "Casimira", "Cassandra", "Cassaundra", "Cassey", "Cassi", "Cassidy", "Cassie", "Cassondra", "Cassy", "Catalina", "Catarina", "Caterina", "Catharine",
			"Catherin", "Catherina", "Catherine", "Cathern", "Catheryn", "Cathey", "Cathi", "Cathie", "Cathleen", "Cathrine", "Cathryn", "Cathy", "Catina", "Catrice", "Catrina",
			"Cayla", "Cecelia", "Cecil", "Cecil", "Cecila", "Cecile", "Cecilia", "Cecille", "Cecily", "Cedric", "Cedrick", "Celena", "Celesta", "Celeste", "Celestina",
			"Celestine", "Celia", "Celina", "Celinda", "Celine", "Celsa", "Ceola", "Cesar", "Chad", "Chadwick", "Chae", "Chan", "Chana", "Chance", "Chanda",
			"Chandra", "Chanel", "Chanell", "Chanelle", "Chang", "Chang", "Chantal", "Chantay", "Chante", "Chantel", "Chantell", "Chantelle", "Chara", "Charis", "Charise",
			"Charissa", "Charisse", "Charita", "Charity", "Charla", "Charleen", "Charlena", "Charlene", "Charles", "Charles", "Charlesetta", "Charlette", "Charley", "Charlie", "Charlie",
			"Charline", "Charlott", "Charlotte", "Charlsie", "Charlyn", "Charmain", "Charmaine", "Charolette", "Chas", "Chase", "Chasidy", "Chasity", "Chassidy", "Chastity", "Chau",
			"Chauncey", "Chaya", "Chelsea", "Chelsey", "Chelsie", "Cher", "Chere", "Cheree", "Cherelle", "Cheri", "Cherie", "Cherilyn", "Cherise", "Cherish", "Cherly",
			"Cherlyn", "Cherri", "Cherrie", "Cherry", "Cherryl", "Chery", "Cheryl", "Cheryle", "Cheryll", "Chester", "Chet", "Cheyenne", "Chi", "Chi", "Chia",
			"Chieko", "Chin", "China", "Ching", "Chiquita", "Chloe", "Chong", "Chong", "Chris", "Chris", "Chrissy", "Christa", "Christal", "Christeen", "Christel",
			"Christen", "Christena", "Christene", "Christi", "Christia", "Christian", "Christian", "Christiana", "Christiane", "Christie", "Christin", "Christina", "Christine", "Christinia", "Christoper",
			"Christopher", "Christopher", "Christy", "Chrystal", "Chu", "Chuck", "Chun", "Chung", "Chung", "Ciara", "Cicely", "Ciera", "Cierra", "Cinda", "Cinderella",
			"Cindi", "Cindie", "Cindy", "Cinthia", "Cira", "Clair", "Clair", "Claire", "Clara", "Clare", "Clarence", "Clarence", "Claretha", "Claretta", "Claribel",
			"Clarice", "Clarinda", "Clarine", "Claris", "Clarisa", "Clarissa", "Clarita", "Clark", "Classie", "Claud", "Claude", "Claude", "Claudette", "Claudia", "Claudie",
			"Claudine", "Claudio", "Clay", "Clayton", "Clelia", "Clemencia", "Clement", "Clemente", "Clementina", "Clementine", "Clemmie", "Cleo", "Cleo", "Cleopatra", "Cleora",
			"Cleotilde", "Cleta", "Cletus", "Cleveland", "Cliff", "Clifford", "Clifton", "Clint", "Clinton", "Clora", "Clorinda", "Clotilde", "Clyde", "Clyde", "Codi",
			"Cody", "Cody", "Colby", "Colby", "Cole", "Coleen", "Coleman", "Colene", "Coletta", "Colette", "Colin", "Colleen", "Collen", "Collene", "Collette",
			"Collin", "Colton", "Columbus", "Concepcion", "Conception", "Concetta", "Concha", "Conchita", "Connie", "Connie", "Conrad", "Constance", "Consuela", "Consuelo", "Contessa",
			"Cora", "Coral", "Coralee", "Coralie", "Corazon", "Cordelia", "Cordell", "Cordia", "Cordie", "Coreen", "Corene", "Coretta", "Corey", "Corey", "Cori",
			"Corie", "Corina", "Corine", "Corinna", "Corinne", "Corliss", "Cornelia", "Cornelius", "Cornell", "Corrie", "Corrin", "Corrina", "Corrine", "Corrinne", "Cortez",
			"Cortney", "Cory", "Cory", "Courtney", "Courtney", "Coy", "Craig", "Creola", "Cris", "Criselda", "Crissy", "Crista", "Cristal", "Cristen", "Cristi",
			"Cristie", "Cristin", "Cristina", "Cristine", "Cristobal", "Cristopher", "Cristy", "Cruz", "Cruz", "Crysta", "Crystal", "Crystle", "Cuc", "Curt", "Curtis",
			"Curtis", "Cyndi", "Cyndy", "Cynthia", "Cyril", "Cyrstal", "Cyrus", "Cythia", "Dacia", "Dagmar", "Dagny", "Dahlia", "Daina", "Daine", "Daisey",
			"Daisy", "Dakota", "Dale", "Dale", "Dalene", "Dalia", "Dalila", "Dallas", "Dallas", "Dalton", "Damaris", "Damian", "Damien", "Damion", "Damon",
			"Dan", "Dan", "Dana", "Dana", "Danae", "Dane", "Danelle", "Danette", "Dani", "Dania", "Danial", "Danica", "Daniel", "Daniel", "Daniela",
			"Daniele", "Daniell", "Daniella", "Danielle", "Danika", "Danille", "Danilo", "Danita", "Dann", "Danna", "Dannette", "Dannie", "Dannie", "Dannielle", "Danny",
			"Dante", "Danuta", "Danyel", "Danyell", "Danyelle", "Daphine", "Daphne", "Dara", "Darby", "Darcel", "Darcey", "Darci", "Darcie", "Darcy", "Darell",
			"Daren", "Daria", "Darin", "Dario", "Darius", "Darla", "Darleen", "Darlena", "Darlene", "Darline", "Darnell", "Darnell", "Daron", "Darrel", "Darrell",
			"Darren", "Darrick", "Darrin", "Darron", "Darryl", "Darwin", "Daryl", "Daryl", "Dave", "David", "David", "Davida", "Davina", "Davis", "Dawn",
			"Dawna", "Dawne", "Dayle", "Dayna", "Daysi", "Deadra", "Dean", "Dean", "Deana", "Deandra", "Deandre", "Deandrea", "Deane", "Deangelo", "Deann",
			"Deanna", "Deanne", "Deb", "Debbi", "Debbie", "Debbra", "Debby", "Debera", "Debi", "Debora", "Deborah", "Debra", "Debrah", "Debroah", "Dede",
			"Dedra", "Dee", "Dee", "Deeann", "Deeanna", "Deedee", "Deedra", "Deena", "Deetta", "Deidra", "Deidre", "Deirdre", "Deja", "Del", "Delaine",
			"Delana", "Delbert", "Delcie", "Delena", "Delfina", "Delia", "Delicia", "Delila", "Delilah", "Delinda", "Delisa", "Dell", "Della", "Delma", "Delmar",
			"Delmer", "Delmy", "Delois", "Deloise", "Delora", "Deloras", "Delores", "Deloris", "Delorse", "Delpha", "Delphia", "Delphine", "Delsie", "Delta", "Demarcus",
			"Demetra", "Demetria", "Demetrice", "Demetrius", "Demetrius", "Dena", "Denae", "Deneen", "Denese", "Denice", "Denis", "Denise", "Denisha", "Denisse", "Denita",
			"Denna", "Dennis", "Dennis", "Dennise", "Denny", "Denny", "Denver", "Denyse", "Deon", "Deon", "Deonna", "Derek", "Derick", "Derrick", "Deshawn",
			"Desirae", "Desire", "Desiree", "Desmond", "Despina", "Dessie", "Destiny", "Detra", "Devin", "Devin", "Devon", "Devon", "Devona", "Devora", "Devorah",
			"Dewayne", "Dewey", "Dewitt", "Dexter", "Dia", "Diamond", "Dian", "Diana", "Diane", "Diann", "Dianna", "Dianne", "Dick", "Diedra", "Diedre",
			"Diego", "Dierdre", "Digna", "Dillon", "Dimple", "Dina", "Dinah", "Dino", "Dinorah", "Dion", "Dion", "Dione", "Dionna", "Dionne", "Dirk",
			"Divina", "Dixie", "Dodie", "Dollie", "Dolly", "Dolores", "Doloris", "Domenic", "Domenica", "Dominga", "Domingo", "Dominic", "Dominica", "Dominick", "Dominique",
			"Dominique", "Dominque", "Domitila", "Domonique", "Don", "Dona", "Donald", "Donald", "Donella", "Donetta", "Donette", "Dong", "Dong", "Donita", "Donn",
			"Donna", "Donnell", "Donnetta", "Donnette", "Donnie", "Donnie", "Donny", "Donovan", "Donte", "Donya", "Dora", "Dorathy", "Dorcas", "Doreatha", "Doreen",
			"Dorene", "Doretha", "Dorethea", "Doretta", "Dori", "Doria", "Dorian", "Dorian", "Dorie", "Dorinda", "Dorine", "Doris", "Dorla", "Dorotha", "Dorothea",
			"Dorothy", "Dorris", "Dorsey", "Dortha", "Dorthea", "Dorthey", "Dorthy", "Dot", "Dottie", "Dotty", "Doug", "Douglas", "Douglass", "Dovie", "Doyle",
			"Dreama", "Drema", "Drew", "Drew", "Drucilla", "Drusilla", "Duane", "Dudley", "Dulce", "Dulcie", "Duncan", "Dung", "Dusti", "Dustin", "Dusty",
			"Dusty", "Dwain", "Dwana", "Dwayne", "Dwight", "Dyan", "Dylan", "Earl", "Earle", "Earlean", "Earleen", "Earlene", "Earlie", "Earline", "Earnest",
			"Earnestine", "Eartha", "Easter", "Eboni", "Ebonie", "Ebony", "Echo", "Ed", "Eda", "Edda", "Eddie", "Eddie", "Eddy", "Edelmira", "Eden",
			"Edgar", "Edgardo", "Edie", "Edison", "Edith", "Edmond", "Edmund", "Edmundo", "Edna", "Edra", "Edris", "Eduardo", "Edward", "Edward", "Edwardo",
			"Edwin", "Edwina", "Edyth", "Edythe", "Effie", "Efrain", "Efren", "Ehtel", "Eileen", "Eilene", "Ela", "Eladia", "Elaina", "Elaine", "Elana",
			"Elane", "Elanor", "Elayne", "Elba", "Elbert", "Elda", "Elden", "Eldon", "Eldora", "Eldridge", "Eleanor", "Eleanora", "Eleanore", "Elease", "Elena",
			"Elene", "Eleni", "Elenor", "Elenora", "Elenore", "Eleonor", "Eleonora", "Eleonore", "Elfreda", "Elfrieda", "Elfriede", "Eli", "Elia", "Eliana", "Elias",
			"Elicia", "Elida", "Elidia", "Elijah", "Elin", "Elina", "Elinor", "Elinore", "Elisa", "Elisabeth", "Elise", "Eliseo", "Elisha", "Elisha", "Elissa",
			"Eliz", "Eliza", "Elizabet", "Elizabeth", "Elizbeth", "Elizebeth", "Elke", "Ella", "Ellamae", "Ellan", "Ellen", "Ellena", "Elli", "Ellie", "Elliot",
			"Elliott", "Ellis", "Ellis", "Ellsworth", "Elly", "Ellyn", "Elma", "Elmer", "Elmer", "Elmira", "Elmo", "Elna", "Elnora", "Elodia", "Elois",
			"Eloisa", "Eloise", "Elouise", "Eloy", "Elroy", "Elsa", "Else", "Elsie", "Elsy", "Elton", "Elva", "Elvera", "Elvia", "Elvie", "Elvin",
			"Elvina", "Elvira", "Elvis", "Elwanda", "Elwood", "Elyse", "Elza", "Ema", "Emanuel", "Emelda", "Emelia", "Emelina", "Emeline", "Emely", "Emerald",
			"Emerita", "Emerson", "Emery", "Emiko", "Emil", "Emile", "Emilee", "Emilia", "Emilie", "Emilio", "Emily", "Emma", "Emmaline", "Emmanuel", "Emmett",
			"Emmie", "Emmitt", "Emmy", "Emogene", "Emory", "Ena", "Enda", "Enedina", "Eneida", "Enid", "Enoch", "Enola", "Enrique", "Enriqueta", "Epifania",
			"Era", "Erasmo", "Eric", "Eric", "Erica", "Erich", "Erick", "Ericka", "Erik", "Erika", "Erin", "Erin", "Erinn", "Erlene", "Erlinda",
			"Erline", "Erma", "Ermelinda", "Erminia", "Erna", "Ernest", "Ernestina", "Ernestine", "Ernesto", "Ernie", "Errol", "Ervin", "Erwin", "Eryn", "Esmeralda",
			"Esperanza", "Essie", "Esta", "Esteban", "Estefana", "Estela", "Estell", "Estella", "Estelle", "Ester", "Esther", "Estrella", "Etha", "Ethan", "Ethel",
			"Ethelene", "Ethelyn", "Ethyl", "Etsuko", "Etta", "Ettie", "Eufemia", "Eugena", "Eugene", "Eugene", "Eugenia", "Eugenie", "Eugenio", "Eula", "Eulah",
			"Eulalia", "Eun", "Euna", "Eunice", "Eura", "Eusebia", "Eusebio", "Eustolia", "Eva", "Evalyn", "Evan", "Evan", "Evangelina", "Evangeline", "Eve",
			"Evelia", "Evelin", "Evelina", "Eveline", "Evelyn", "Evelyne", "Evelynn", "Everett", "Everette", "Evette", "Evia", "Evie", "Evita", "Evon", "Evonne",
			"Ewa", "Exie", "Ezekiel", "Ezequiel", "Ezra", "Fabian", "Fabiola", "Fae", "Fairy", "Faith", "Fallon", "Fannie", "Fanny", "Farah", "Farrah",
			"Fatima", "Fatimah", "Faustina", "Faustino", "Fausto", "Faviola", "Fawn", "Fay", "Faye", "Fe", "Federico", "Felecia", "Felica", "Felice", "Felicia",
			"Felicidad", "Felicita", "Felicitas", "Felipa", "Felipe", "Felisa", "Felisha", "Felix", "Felton", "Ferdinand", "Fermin", "Fermina", "Fern", "Fernanda", "Fernande",
			"Fernando", "Ferne", "Fidel", "Fidela", "Fidelia", "Filiberto", "Filomena", "Fiona", "Flavia", "Fleta", "Fletcher", "Flo", "Flor", "Flora", "Florance",
			"Florence", "Florencia", "Florencio", "Florene", "Florentina", "Florentino", "Floretta", "Floria", "Florida", "Florinda", "Florine", "Florrie", "Flossie", "Floy", "Floyd",
			"Fonda", "Forest", "Forrest", "Foster", "Fran", "France", "Francene", "Frances", "Frances", "Francesca", "Francesco", "Franchesca", "Francie", "Francina", "Francine",
			"Francis", "Francis", "Francisca", "Francisco", "Francisco", "Francoise", "Frank", "Frank", "Frankie", "Frankie", "Franklin", "Franklyn", "Fransisca", "Fred", "Fred",
			"Freda", "Fredda", "Freddie", "Freddie", "Freddy", "Frederic", "Frederica", "Frederick", "Fredericka", "Fredia", "Fredric", "Fredrick", "Fredricka", "Freeda", "Freeman",
			"Freida", "Frida", "Frieda", "Fritz", "Fumiko", "Gabriel", "Gabriel", "Gabriela", "Gabriele", "Gabriella", "Gabrielle", "Gail", "Gail", "Gala", "Gale",
			"Gale", "Galen", "Galina", "Garfield", "Garland", "Garnet", "Garnett", "Garret", "Garrett", "Garry", "Garth", "Gary", "Gary", "Gaston", "Gavin",
			"Gay", "Gaye", "Gayla", "Gayle", "Gayle", "Gaylene", "Gaylord", "Gaynell", "Gaynelle", "Gearldine", "Gema", "Gemma", "Gena", "Genaro", "Gene",
			"Gene", "Genesis", "Geneva", "Genevie", "Genevieve", "Genevive", "Genia", "Genie", "Genna", "Gennie", "Genny", "Genoveva", "Geoffrey", "Georgann", "George",
			"George", "Georgeann", "Georgeanna", "Georgene", "Georgetta", "Georgette", "Georgia", "Georgiana", "Georgiann", "Georgianna", "Georgianne", "Georgie", "Georgina", "Georgine", "Gerald",
			"Gerald", "Geraldine", "Geraldo", "Geralyn", "Gerard", "Gerardo", "Gerda", "Geri", "Germaine", "German", "Gerri", "Gerry", "Gerry", "Gertha", "Gertie",
			"Gertrud", "Gertrude", "Gertrudis", "Gertude", "Ghislaine", "Gia", "Gianna", "Gidget", "Gigi", "Gil", "Gilbert", "Gilberte", "Gilberto", "Gilda", "Gillian",
			"Gilma", "Gina", "Ginette", "Ginger", "Ginny", "Gino", "Giovanna", "Giovanni", "Gisela", "Gisele", "Giselle", "Gita", "Giuseppe", "Giuseppina", "Gladis",
			"Glady", "Gladys", "Glayds", "Glen", "Glenda", "Glendora", "Glenn", "Glenn", "Glenna", "Glennie", "Glennis", "Glinda", "Gloria", "Glory", "Glynda",
			"Glynis", "Golda", "Golden", "Goldie", "Gonzalo", "Gordon", "Grace", "Gracia", "Gracie", "Graciela", "Grady", "Graham", "Graig", "Grant", "Granville",
			"Grayce", "Grazyna", "Greg", "Gregg", "Gregoria", "Gregorio", "Gregory", "Gregory", "Greta", "Gretchen", "Gretta", "Gricelda", "Grisel", "Griselda", "Grover",
			"Guadalupe", "Guadalupe", "Gudrun", "Guillermina", "Guillermo", "Gus", "Gussie", "Gustavo", "Guy", "Gwen", "Gwenda", "Gwendolyn", "Gwenn", "Gwyn", "Gwyneth",
			"Ha", "Hae", "Hai", "Hailey", "Hal", "Haley", "Halina", "Halley", "Hallie", "Han", "Hana", "Hang", "Hanh", "Hank", "Hanna",
			"Hannah", "Hannelore", "Hans", "Harlan", "Harland", "Harley", "Harmony", "Harold", "Harold", "Harriet", "Harriett", "Harriette", "Harris", "Harrison", "Harry",
			"Harvey", "Hassan", "Hassie", "Hattie", "Haydee", "Hayden", "Hayley", "Haywood", "Hazel", "Heath", "Heather", "Hector", "Hedwig", "Hedy", "Hee",
			"Heide", "Heidi", "Heidy", "Heike", "Helaine", "Helen", "Helena", "Helene", "Helga", "Hellen", "Henrietta", "Henriette", "Henry", "Henry", "Herb",
			"Herbert", "Heriberto", "Herlinda", "Herma", "Herman", "Hermelinda", "Hermila", "Hermina", "Hermine", "Herminia", "Herschel", "Hershel", "Herta", "Hertha", "Hester",
			"Hettie", "Hiedi", "Hien", "Hilaria", "Hilario", "Hilary", "Hilda", "Hilde", "Hildegard", "Hildegarde", "Hildred", "Hillary", "Hilma", "Hilton", "Hipolito",
			"Hiram", "Hiroko", "Hisako", "Hoa", "Hobert", "Holley", "Holli", "Hollie", "Hollis", "Hollis", "Holly", "Homer", "Honey", "Hong", "Hong",
			"Hope", "Horace", "Horacio", "Hortencia", "Hortense", "Hortensia", "Hosea", "Houston", "Howard", "Hoyt", "Hsiu", "Hubert", "Hue", "Huey", "Hugh",
			"Hugo", "Hui", "Hulda", "Humberto", "Hung", "Hunter", "Huong", "Hwa", "Hyacinth", "Hye", "Hyman", "Hyo", "Hyon", "Hyun", "Ian",
			"Ida", "Idalia", "Idell", "Idella", "Iesha", "Ignacia", "Ignacio", "Ike", "Ila", "Ilana", "Ilda", "Ileana", "Ileen", "Ilene", "Iliana",
			"Illa", "Ilona", "Ilse", "Iluminada", "Ima", "Imelda", "Imogene", "In", "Ina", "India", "Indira", "Inell", "Ines", "Inez", "Inga",
			"Inge", "Ingeborg", "Inger", "Ingrid", "Inocencia", "Iola", "Iona", "Ione", "Ira", "Ira", "Iraida", "Irena", "Irene", "Irina", "Iris",
			"Irish", "Irma", "Irmgard", "Irvin", "Irving", "Irwin", "Isa", "Isaac", "Isabel", "Isabell", "Isabella", "Isabelle", "Isadora", "Isaiah", "Isaias",
			"Isaura", "Isela", "Isiah", "Isidra", "Isidro", "Isis", "Ismael", "Isobel", "Israel", "Isreal", "Issac", "Iva", "Ivan", "Ivana", "Ivelisse",
			"Ivette", "Ivey", "Ivonne", "Ivory", "Ivory", "Ivy", "Izetta", "Izola", "Ja", "Jacalyn", "Jacelyn", "Jacinda", "Jacinta", "Jacinto", "Jack",
			"Jack", "Jackeline", "Jackelyn", "Jacki", "Jackie", "Jackie", "Jacklyn", "Jackqueline", "Jackson", "Jaclyn", "Jacob", "Jacqualine", "Jacque", "Jacquelin", "Jacqueline",
			"Jacquelyn", "Jacquelyne", "Jacquelynn", "Jacques", "Jacquetta", "Jacqui", "Jacquie", "Jacquiline", "Jacquline", "Jacqulyn", "Jada", "Jade", "Jadwiga", "Jae", "Jae",
			"Jaime", "Jaime", "Jaimee", "Jaimie", "Jake", "Jaleesa", "Jalisa", "Jama", "Jamaal", "Jamal", "Jamar", "Jame", "Jame", "Jamee", "Jamel",
			"James", "James", "Jamey", "Jamey", "Jami", "Jamie", "Jamie", "Jamika", "Jamila", "Jamison", "Jammie", "Jan", "Jan", "Jana", "Janae",
			"Janay", "Jane", "Janean", "Janee", "Janeen", "Janel", "Janell", "Janella", "Janelle", "Janene", "Janessa", "Janet", "Janeth", "Janett", "Janetta",
			"Janette", "Janey", "Jani", "Janice", "Janie", "Janiece", "Janina", "Janine", "Janis", "Janise", "Janita", "Jann", "Janna", "Jannet", "Jannette",
			"Jannie", "January", "Janyce", "Jaqueline", "Jaquelyn", "Jared", "Jarod", "Jarred", "Jarrett", "Jarrod", "Jarvis", "Jasmin", "Jasmine", "Jason", "Jason",
			"Jasper", "Jaunita", "Javier", "Jay", "Jay", "Jaye", "Jayme", "Jaymie", "Jayna", "Jayne", "Jayson", "Jazmin", "Jazmine", "Jc", "Jean",
			"Jean", "Jeana", "Jeane", "Jeanelle", "Jeanene", "Jeanett", "Jeanetta", "Jeanette", "Jeanice", "Jeanie", "Jeanine", "Jeanmarie", "Jeanna", "Jeanne", "Jeannetta",
			"Jeannette", "Jeannie", "Jeannine", "Jed", "Jeff", "Jefferey", "Jefferson", "Jeffery", "Jeffie", "Jeffrey", "Jeffrey", "Jeffry", "Jen", "Jena", "Jenae",
			"Jene", "Jenee", "Jenell", "Jenelle", "Jenette", "Jeneva", "Jeni", "Jenice", "Jenifer", "Jeniffer", "Jenine", "Jenise", "Jenna", "Jennefer", "Jennell",
			"Jennette", "Jenni", "Jennie", "Jennifer", "Jenniffer", "Jennine", "Jenny", "Jerald", "Jeraldine", "Jeramy", "Jere", "Jeremiah", "Jeremy", "Jeremy", "Jeri",
			"Jerica", "Jerilyn", "Jerlene", "Jermaine", "Jerold", "Jerome", "Jeromy", "Jerrell", "Jerri", "Jerrica", "Jerrie", "Jerrod", "Jerrold", "Jerry", "Jerry",
			"Jesenia", "Jesica", "Jess", "Jesse", "Jesse", "Jessenia", "Jessi", "Jessia", "Jessica", "Jessie", "Jessie", "Jessika", "Jestine", "Jesus", "Jesus",
			"Jesusa", "Jesusita", "Jetta", "Jettie", "Jewel", "Jewel", "Jewell", "Jewell", "Ji", "Jill", "Jillian", "Jim", "Jimmie", "Jimmie", "Jimmy",
			"Jimmy", "Jin", "Jina", "Jinny", "Jo", "Joan", "Joan", "Joana", "Joane", "Joanie", "Joann", "Joanna", "Joanne", "Joannie", "Joaquin",
			"Joaquina", "Jocelyn", "Jodee", "Jodi", "Jodie", "Jody", "Jody", "Joe", "Joe", "Joeann", "Joel", "Joel", "Joella", "Joelle", "Joellen",
			"Joesph", "Joetta", "Joette", "Joey", "Joey", "Johana", "Johanna", "Johanne", "John", "John", "Johna", "Johnathan", "Johnathon", "Johnetta", "Johnette",
			"Johnie", "Johnie", "Johnna", "Johnnie", "Johnnie", "Johnny", "Johnny", "Johnsie", "Johnson", "Joi", "Joie", "Jolanda", "Joleen", "Jolene", "Jolie",
			"Joline", "Jolyn", "Jolynn", "Jon", "Jon", "Jona", "Jonah", "Jonas", "Jonathan", "Jonathon", "Jone", "Jonell", "Jonelle", "Jong", "Joni",
			"Jonie", "Jonna", "Jonnie", "Jordan", "Jordan", "Jordon", "Jorge", "Jose", "Jose", "Josef", "Josefa", "Josefina", "Josefine", "Joselyn", "Joseph",
			"Joseph", "Josephina", "Josephine", "Josette", "Josh", "Joshua", "Joshua", "Josiah", "Josie", "Joslyn", "Jospeh", "Josphine", "Josue", "Jovan", "Jovita",
			"Joy", "Joya", "Joyce", "Joycelyn", "Joye", "Juan", "Juan", "Juana", "Juanita", "Jude", "Jude", "Judi", "Judie", "Judith", "Judson",
			"Judy", "Jule", "Julee", "Julene", "Jules", "Juli", "Julia", "Julian", "Julian", "Juliana", "Juliane", "Juliann", "Julianna", "Julianne", "Julie",
			"Julieann", "Julienne", "Juliet", "Julieta", "Julietta", "Juliette", "Julio", "Julio", "Julissa", "Julius", "June", "Jung", "Junie", "Junior", "Junita",
			"Junko", "Justa", "Justin", "Justin", "Justina", "Justine", "Jutta", "Ka", "Kacey", "Kaci", "Kacie", "Kacy", "Kai", "Kaila", "Kaitlin",
			"Kaitlyn", "Kala", "Kaleigh", "Kaley", "Kali", "Kallie", "Kalyn", "Kam", "Kamala", "Kami", "Kamilah", "Kandace", "Kandi", "Kandice", "Kandis",
			"Kandra", "Kandy", "Kanesha", "Kanisha", "Kara", "Karan", "Kareem", "Kareen", "Karen", "Karena", "Karey", "Kari", "Karie", "Karima", "Karin",
			"Karina", "Karine", "Karisa", "Karissa", "Karl", "Karl", "Karla", "Karleen", "Karlene", "Karly", "Karlyn", "Karma", "Karmen", "Karol", "Karole",
			"Karoline", "Karolyn", "Karon", "Karren", "Karri", "Karrie", "Karry", "Kary", "Karyl", "Karyn", "Kasandra", "Kasey", "Kasey", "Kasha", "Kasi",
			"Kasie", "Kassandra", "Kassie", "Kate", "Katelin", "Katelyn", "Katelynn", "Katerine", "Kathaleen", "Katharina", "Katharine", "Katharyn", "Kathe", "Katheleen", "Katherin",
			"Katherina", "Katherine", "Kathern", "Katheryn", "Kathey", "Kathi", "Kathie", "Kathleen", "Kathlene", "Kathline", "Kathlyn", "Kathrin", "Kathrine", "Kathryn", "Kathryne",
			"Kathy", "Kathyrn", "Kati", "Katia", "Katie", "Katina", "Katlyn", "Katrice", "Katrina", "Kattie", "Katy", "Kay", "Kayce", "Kaycee", "Kaye",
			"Kayla", "Kaylee", "Kayleen", "Kayleigh", "Kaylene", "Kazuko", "Kecia", "Keeley", "Keely", "Keena", "Keenan", "Keesha", "Keiko", "Keila", "Keira",
			"Keisha", "Keith", "Keith", "Keitha", "Keli", "Kelle", "Kellee", "Kelley", "Kelley", "Kelli", "Kellie", "Kelly", "Kelly", "Kellye", "Kelsey",
			"Kelsi", "Kelsie", "Kelvin", "Kemberly", "Ken", "Kena", "Kenda", "Kendal", "Kendall", "Kendall", "Kendra", "Kendrick", "Keneth", "Kenia", "Kenisha",
			"Kenna", "Kenneth", "Kenneth", "Kennith", "Kenny", "Kent", "Kenton", "Kenya", "Kenyatta", "Kenyetta", "Kera", "Keren", "Keri", "Kermit", "Kerri",
			"Kerrie", "Kerry", "Kerry", "Kerstin", "Kesha", "Keshia", "Keturah", "Keva", "Keven", "Kevin", "Kevin", "Khadijah", "Khalilah", "Kia", "Kiana",
			"Kiara", "Kiera", "Kiersten", "Kiesha", "Kieth", "Kiley", "Kim", "Kim", "Kimber", "Kimberely", "Kimberlee", "Kimberley", "Kimberli", "Kimberlie", "Kimberly",
			"Kimbery", "Kimbra", "Kimi", "Kimiko", "Kina", "Kindra", "King", "Kip", "Kira", "Kirby", "Kirby", "Kirk", "Kirsten", "Kirstie", "Kirstin",
			"Kisha", "Kit", "Kittie", "Kitty", "Kiyoko", "Kizzie", "Kizzy", "Klara", "Korey", "Kori", "Kortney", "Kory", "Kourtney", "Kraig", "Kris",
			"Kris", "Krishna", "Krissy", "Krista", "Kristal", "Kristan", "Kristeen", "Kristel", "Kristen", "Kristi", "Kristian", "Kristie", "Kristin", "Kristina", "Kristine",
			"Kristle", "Kristofer", "Kristopher", "Kristy", "Kristyn", "Krysta", "Krystal", "Krysten", "Krystin", "Krystina", "Krystle", "Krystyna", "Kum", "Kurt", "Kurtis",
			"Kyla", "Kyle", "Kyle", "Kylee", "Kylie", "Kym", "Kymberly", "Kyoko", "Kyong", "Kyra", "Kyung", "Lacey", "Lachelle", "Laci", "Lacie",
			"Lacresha", "Lacy", "Lacy", "Ladawn", "Ladonna", "Lady", "Lael", "Lahoma", "Lai", "Laila", "Laine", "Lajuana", "Lakeesha", "Lakeisha", "Lakendra",
			"Lakenya", "Lakesha", "Lakeshia", "Lakia", "Lakiesha", "Lakisha", "Lakita", "Lala", "Lamar", "Lamonica", "Lamont", "Lan", "Lana", "Lance", "Landon",
			"Lane", "Lane", "Lanell", "Lanelle", "Lanette", "Lang", "Lani", "Lanie", "Lanita", "Lannie", "Lanny", "Lanora", "Laquanda", "Laquita", "Lara",
			"Larae", "Laraine", "Laree", "Larhonda", "Larisa", "Larissa", "Larita", "Laronda", "Larraine", "Larry", "Larry", "Larue", "Lasandra", "Lashanda", "Lashandra",
			"Lashaun", "Lashaunda", "Lashawn", "Lashawna", "Lashawnda", "Lashay", "Lashell", "Lashon", "Lashonda", "Lashunda", "Lasonya", "Latanya", "Latarsha", "Latasha",
			"Latashia", "Latesha", "Latia", "Laticia", "Latina", "Latisha", "Latonia", "Latonya", "Latoria", "Latosha", "Latoya", "Latoyia", "Latrice", "Latricia", "Latrina",
			"Latrisha", "Launa", "Laura", "Lauralee", "Lauran", "Laure", "Laureen", "Laurel", "Lauren", "Lauren", "Laurena", "Laurence", "Laurence", "Laurene", "Lauretta",
			"Laurette", "Lauri", "Laurice", "Laurie", "Laurinda", "Laurine", "Lauryn", "Lavada", "Lavelle", "Lavenia", "Lavera", "Lavern", "Lavern", "Laverna", "Laverne",
			"Laverne", "Laveta", "Lavette", "Lavina", "Lavinia", "Lavon", "Lavona", "Lavonda", "Lavone", "Lavonia", "Lavonna", "Lavonne", "Lawana", "Lawanda", "Lawanna",
			"Lawerence", "Lawrence", "Lawrence", "Layla", "Layne", "Lazaro", "Le", "Lea", "Leah", "Lean", "Leana", "Leandra", "Leandro", "Leann", "Leanna",
			"Leanne", "Leanora", "Leatha", "Leatrice", "Lecia", "Leda", "Lee", "Lee", "Leeann", "Leeanna", "Leeanne", "Leena", "Leesa", "Leia", "Leida",
			"Leif", "Leigh", "Leigh", "Leigha", "Leighann", "Leila", "Leilani", "Leisa", "Leisha", "Lekisha", "Lela", "Lelah", "Leland", "Lelia", "Lemuel",
			"Len", "Lena", "Lenard", "Lenita", "Lenna", "Lennie", "Lenny", "Lenora", "Lenore", "Leo", "Leo", "Leola", "Leoma", "Leon", "Leon",
			"Leona", "Leonard", "Leonarda", "Leonardo", "Leone", "Leonel", "Leonia", "Leonida", "Leonie", "Leonila", "Leonor", "Leonora", "Leonore", "Leontine", "Leopoldo",
			"Leora", "Leota", "Lera", "Leroy", "Les", "Lesa", "Lesha", "Lesia", "Leslee", "Lesley", "Lesley", "Lesli", "Leslie", "Leslie", "Lessie",
			"Lester", "Lester", "Leta", "Letha", "Leticia", "Letisha", "Letitia", "Lettie", "Letty", "Levi", "Lewis", "Lewis", "Lexie", "Lezlie", "Li",
			"Lia", "Liana", "Liane", "Lianne", "Libbie", "Libby", "Liberty", "Librada", "Lida", "Lidia", "Lien", "Lieselotte", "Ligia", "Lila", "Lili",
			"Lilia", "Lilian", "Liliana", "Lilla", "Lilli", "Lillia", "Lilliam", "Lillian", "Lilliana", "Lillie", "Lilly", "Lily", "Lin", "Lina", "Lincoln",
			"Linda", "Lindsay", "Lindsay", "Lindsey", "Lindsey", "Lindsy", "Lindy", "Linette", "Ling", "Linh", "Linn", "Linnea", "Linnie", "Lino", "Linsey",
			"Linwood", "Lionel", "Lisa", "Lisabeth", "Lisandra", "Lisbeth", "Lise", "Lisette", "Lisha", "Lissa", "Lissette", "Lita", "Livia", "Liz", "Liza",
			"Lizabeth", "Lizbeth", "Lizeth", "Lizette", "Lizzette", "Lizzie", "Lloyd", "Loan", "Logan", "Logan", "Loida", "Lois", "Loise", "Lola", "Lolita",
			"Loma", "Lon", "Lona", "Londa", "Long", "Loni", "Lonna", "Lonnie", "Lonnie", "Lonny", "Lora", "Loraine", "Loralee", "Lore", "Lorean",
			"Loree", "Loreen", "Lorelei", "Loren", "Loren", "Lorena", "Lorene", "Lorenza", "Lorenzo", "Loreta", "Loretta", "Lorette", "Lori", "Loria", "Loriann",
			"Lorie", "Lorilee", "Lorina", "Lorinda", "Lorine", "Loris", "Lorita", "Lorna", "Lorraine", "Lorretta", "Lorri", "Lorriane", "Lorrie", "Lorrine", "Lory",
			"Lottie", "Lou", "Lou", "Louann", "Louanne", "Louella", "Louetta", "Louie", "Louie", "Louis", "Louis", "Louisa", "Louise", "Loura", "Lourdes",
			"Lourie", "Louvenia", "Love", "Lovella", "Lovetta", "Lovie", "Lowell", "Loyce", "Loyd", "Lu", "Luana", "Luann", "Luanna", "Luanne", "Luba",
			"Lucas", "Luci", "Lucia", "Luciana", "Luciano", "Lucie", "Lucien", "Lucienne", "Lucila", "Lucile", "Lucilla", "Lucille", "Lucina", "Lucinda", "Lucio",
			"Lucius", "Lucrecia", "Lucretia", "Lucy", "Ludie", "Ludivina", "Lue", "Luella", "Luetta", "Luigi", "Luis", "Luis", "Luisa", "Luise", "Luke",
			"Lula", "Lulu", "Luna", "Lupe", "Lupe", "Lupita", "Lura", "Lurlene", "Lurline", "Luther", "Luvenia", "Luz", "Lyda", "Lydia", "Lyla",
			"Lyle", "Lyman", "Lyn", "Lynda", "Lyndia", "Lyndon", "Lyndsay", "Lyndsey", "Lynell", "Lynelle", "Lynetta", "Lynette", "Lynn", "Lynn", "Lynna",
			"Lynne", "Lynnette", "Lynsey", "Lynwood", "Ma", "Mabel", "Mabelle", "Mable", "Mac", "Machelle", "Macie", "Mack", "Mackenzie", "Macy", "Madalene",
			"Madaline", "Madalyn", "Maddie", "Madelaine", "Madeleine", "Madelene", "Madeline", "Madelyn", "Madge", "Madie", "Madison", "Madlyn", "Madonna", "Mae", "Maegan",
			"Mafalda", "Magali", "Magaly", "Magan", "Magaret", "Magda", "Magdalen", "Magdalena", "Magdalene", "Magen", "Maggie", "Magnolia", "Mahalia", "Mai", "Maia",
			"Maida", "Maile", "Maira", "Maire", "Maisha", "Maisie", "Major", "Majorie", "Makeda", "Malcolm", "Malcom", "Malena", "Malia", "Malik", "Malika",
			"Malinda", "Malisa", "Malissa", "Malka", "Mallie", "Mallory", "Malorie", "Malvina", "Mamie", "Mammie", "Man", "Man", "Mana", "Manda", "Mandi",
			"Mandie", "Mandy", "Manie", "Manual", "Manuel", "Manuela", "Many", "Mao", "Maple", "Mara", "Maragaret", "Maragret", "Maranda", "Marc", "Marcel",
			"Marcela", "Marcelene", "Marcelina", "Marceline", "Marcelino", "Marcell", "Marcella", "Marcelle", "Marcellus", "Marcelo", "Marcene", "Marchelle", "Marci", "Marcia", "Marcie",
			"Marco", "Marcos", "Marcus", "Marcy", "Mardell", "Maren", "Marg", "Margaret", "Margareta", "Margarete", "Margarett", "Margaretta", "Margarette", "Margarita", "Margarite",
			"Margarito", "Margart", "Marge", "Margene", "Margeret", "Margert", "Margery", "Marget", "Margherita", "Margie", "Margit", "Margo", "Margorie", "Margot", "Margret",
			"Margrett", "Marguerita", "Marguerite", "Margurite", "Margy", "Marhta", "Mari", "Maria", "Maria", "Mariah", "Mariam", "Marian", "Mariana", "Marianela", "Mariann",
			"Marianna", "Marianne", "Mariano", "Maribel", "Maribeth", "Marica", "Maricela", "Maricruz", "Marie", "Mariel", "Mariela", "Mariella", "Marielle", "Marietta", "Mariette",
			"Mariko", "Marilee", "Marilou", "Marilu", "Marilyn", "Marilynn", "Marin", "Marina", "Marinda", "Marine", "Mario", "Mario", "Marion", "Marion", "Maris",
			"Marisa", "Marisela", "Marisha", "Marisol", "Marissa", "Marita", "Maritza", "Marivel", "Marjorie", "Marjory", "Mark", "Mark", "Marketta", "Markita", "Markus",
			"Marla", "Marlana", "Marleen", "Marlen", "Marlena", "Marlene", "Marlin", "Marlin", "Marline", "Marlo", "Marlon", "Marlyn", "Marlys", "Marna", "Marni",
			"Marnie", "Marquerite", "Marquetta", "Marquis", "Marquita", "Marquitta", "Marry", "Marsha", "Marshall", "Marshall", "Marta", "Marth", "Martha", "Marti", "Martin",
			"Martin", "Martina", "Martine", "Marty", "Marty", "Marva", "Marvel", "Marvella", "Marvin", "Marvis", "Marx", "Mary", "Mary", "Marya", "Maryalice",
			"Maryam", "Maryann", "Maryanna", "Maryanne", "Marybelle", "Marybeth", "Maryellen", "Maryetta", "Maryjane", "Maryjo", "Maryland", "Marylee", "Marylin", "Maryln", "Marylou",
			"Marylouise", "Marylyn", "Marylynn", "Maryrose", "Masako", "Mason", "Matha", "Mathew", "Mathilda", "Mathilde", "Matilda", "Matilde", "Matt", "Matthew", "Matthew",
			"Mattie", "Maud", "Maude", "Maudie", "Maura", "Maureen", "Maurice", "Maurice", "Mauricio", "Maurine", "Maurita", "Mauro", "Mavis", "Max", "Maxie",
			"Maxima", "Maximina", "Maximo", "Maxine", "Maxwell", "May", "Maya", "Maybell", "Maybelle", "Maye", "Mayme", "Maynard", "Mayola", "Mayra", "Mazie",
			"Mckenzie", "Mckinley", "Meagan", "Meaghan", "Mechelle", "Meda", "Mee", "Meg", "Megan", "Meggan", "Meghan", "Meghann", "Mei", "Mel", "Melaine",
			"Melani", "Melania", "Melanie", "Melany", "Melba", "Melda", "Melia", "Melida", "Melina", "Melinda", "Melisa", "Melissa", "Melissia", "Melita", "Mellie",
			"Mellisa", "Mellissa", "Melodee", "Melodi", "Melodie", "Melody", "Melonie", "Melony", "Melva", "Melvin", "Melvin", "Melvina", "Melynda", "Mendy", "Mercedes",
			"Mercedez", "Mercy", "Meredith", "Meri", "Merideth", "Meridith", "Merilyn", "Merissa", "Merle", "Merle", "Merlene", "Merlin", "Merlyn", "Merna", "Merri",
			"Merrie", "Merrilee", "Merrill", "Merrill", "Merry", "Mertie", "Mervin", "Meryl", "Meta", "Mi", "Mia", "Mica", "Micaela", "Micah", "Micah",
			"Micha", "Michael", "Michael", "Michaela", "Michaele", "Michal", "Michal", "Michale", "Micheal", "Micheal", "Michel", "Michel", "Michele", "Michelina", "Micheline",
			"Michell", "Michelle", "Michiko", "Mickey", "Mickey", "Micki", "Mickie", "Miesha", "Migdalia", "Mignon", "Miguel", "Miguelina", "Mika", "Mikaela", "Mike",
			"Mike", "Mikel", "Miki", "Mikki", "Mila", "Milagro", "Milagros", "Milan", "Milda", "Mildred", "Miles", "Milford", "Milissa", "Millard", "Millicent",
			"Millie", "Milly", "Milo", "Milton", "Mimi", "Min", "Mina", "Minda", "Mindi", "Mindy", "Minerva", "Ming", "Minh", "Minh", "Minna",
			"Minnie", "Minta", "Miquel", "Mira", "Miranda", "Mireille", "Mirella", "Mireya", "Miriam", "Mirian", "Mirna", "Mirta", "Mirtha", "Misha", "Miss",
			"Missy", "Misti", "Mistie", "Misty", "Mitch", "Mitchel", "Mitchell", "Mitchell", "Mitsue", "Mitsuko", "Mittie", "Mitzi", "Mitzie", "Miyoko", "Modesta",
			"Modesto", "Mohamed", "Mohammad", "Mohammed", "Moira", "Moises", "Mollie", "Molly", "Mona", "Monet", "Monica", "Monika", "Monique", "Monnie", "Monroe",
			"Monserrate", "Monte", "Monty", "Moon", "Mora", "Morgan", "Morgan", "Moriah", "Morris", "Morton", "Mose", "Moses", "Moshe", "Mozell", "Mozella",
			"Mozelle", "Mui", "Muoi", "Muriel", "Murray", "My", "Myesha", "Myles", "Myong", "Myra", "Myriam", "Myrl", "Myrle", "Myrna", "Myron",
			"Myrta", "Myrtice", "Myrtie", "Myrtis", "Myrtle", "Myung", "Na", "Nada", "Nadene", "Nadia", "Nadine", "Naida", "Nakesha", "Nakia", "Nakisha",
			"Nakita", "Nam", "Nan", "Nana", "Nancee", "Nancey", "Nanci", "Nancie", "Nancy", "Nanette", "Nannette", "Nannie", "Naoma", "Naomi", "Napoleon",
			"Narcisa", "Natacha", "Natalia", "Natalie", "Natalya", "Natasha", "Natashia", "Nathalie", "Nathan", "Nathanael", "Nathanial", "Nathaniel", "Natisha", "Natividad", "Natosha",
			"Neal", "Necole", "Ned", "Neda", "Nedra", "Neely", "Neida", "Neil", "Nelda", "Nelia", "Nelida", "Nell", "Nella", "Nelle", "Nellie",
			"Nelly", "Nelson", "Nena", "Nenita", "Neoma", "Neomi", "Nereida", "Nerissa", "Nery", "Nestor", "Neta", "Nettie", "Neva", "Nevada", "Neville",
			"Newton", "Nga", "Ngan", "Ngoc", "Nguyet", "Nia", "Nichelle", "Nichol", "Nicholas", "Nichole", "Nicholle", "Nick", "Nicki", "Nickie", "Nickolas",
			"Nickole", "Nicky", "Nicky", "Nicol", "Nicola", "Nicolas", "Nicolasa", "Nicole", "Nicolette", "Nicolle", "Nida", "Nidia", "Niesha", "Nieves", "Nigel",
			"Niki", "Nikia", "Nikita", "Nikki", "Nikole", "Nila", "Nilda", "Nilsa", "Nina", "Ninfa", "Nisha", "Nita", "Noah", "Noble", "Nobuko",
			"Noe", "Noel", "Noel", "Noelia", "Noella", "Noelle", "Noemi", "Nohemi", "Nola", "Nolan", "Noma", "Nona", "Nora", "Norah", "Norbert",
			"Norberto", "Noreen", "Norene", "Noriko", "Norine", "Norma", "Norman", "Norman", "Normand", "Norris", "Nova", "Novella", "Nu", "Nubia", "Numbers",
			"Numbers", "Nydia", "Nyla", "Obdulia", "Ocie", "Octavia", "Octavio", "Oda", "Odelia", "Odell", "Odell", "Odessa", "Odette", "Odilia", "Odis",
			"Ofelia", "Ok", "Ola", "Olen", "Olene", "Oleta", "Olevia", "Olga", "Olimpia", "Olin", "Olinda", "Oliva", "Olive", "Oliver", "Olivia",
			"Ollie", "Ollie", "Olympia", "Oma", "Omar", "Omega", "Omer", "Ona", "Oneida", "Onie", "Onita", "Opal", "Ophelia", "Ora", "Oralee",
			"Oralia", "Oren", "Oretha", "Orlando", "Orpha", "Orval", "Orville", "Oscar", "Oscar", "Ossie", "Osvaldo", "Oswaldo", "Otelia", "Otha", "Otha",
			"Otilia", "Otis", "Otto", "Ouida", "Owen", "Ozell", "Ozella", "Ozie", "Pa", "Pablo", "Page", "Paige", "Palma", "Palmer", "Palmira",
			"Pam", "Pamala", "Pamela", "Pamelia", "Pamella", "Pamila", "Pamula", "Pandora", "Pansy", "Paola", "Paris", "Paris", "Parker", "Parthenia", "Particia",
			"Pasquale", "Pasty", "Pat", "Pat", "Patience", "Patria", "Patrica", "Patrice", "Patricia", "Patricia", "Patrick", "Patrick", "Patrina", "Patsy", "Patti",
			"Pattie", "Patty", "Paul", "Paul", "Paula", "Paulene", "Pauletta", "Paulette", "Paulina", "Pauline", "Paulita", "Paz", "Pearl", "Pearle", "Pearlene",
			"Pearlie", "Pearline", "Pearly", "Pedro", "Peg", "Peggie", "Peggy", "Pei", "Penelope", "Penney", "Penni", "Pennie", "Penny", "Percy", "Perla",
			"Perry", "Perry", "Pete", "Peter", "Peter", "Petra", "Petrina", "Petronila", "Phebe", "Phil", "Philip", "Phillip", "Phillis", "Philomena", "Phoebe",
			"Phung", "Phuong", "Phylicia", "Phylis", "Phyliss", "Phyllis", "Pia", "Piedad", "Pierre", "Pilar", "Ping", "Pinkie", "Piper", "Pok", "Polly",
			"Porfirio", "Porsche", "Porsha", "Porter", "Portia", "Precious", "Preston", "Pricilla", "Prince", "Princess", "Priscila", "Priscilla", "Providencia", "Prudence", "Pura",
			"Qiana", "Queen", "Queenie", "Quentin", "Quiana", "Quincy", "Quinn", "Quinn", "Quintin", "Quinton", "Quyen", "Rachael", "Rachal", "Racheal", "Rachel",
			"Rachele", "Rachell", "Rachelle", "Racquel", "Rae", "Raeann", "Raelene", "Rafael", "Rafaela", "Raguel", "Raina", "Raisa", "Raleigh", "Ralph", "Ramiro",
			"Ramon", "Ramona", "Ramonita", "Rana", "Ranae", "Randa", "Randal", "Randall", "Randee", "Randell", "Randi", "Randolph", "Randy", "Randy", "Ranee",
			"Raphael", "Raquel", "Rashad", "Rasheeda", "Rashida", "Raul", "Raven", "Ray", "Ray", "Raye", "Rayford", "Raylene", "Raymon", "Raymond", "Raymond",
			"Raymonde", "Raymundo", "Rayna", "Rea", "Reagan", "Reanna", "Reatha", "Reba", "Rebbeca", "Rebbecca", "Rebeca", "Rebecca", "Rebecka", "Rebekah", "Reda",
			"Reed", "Reena", "Refugia", "Refugio", "Refugio", "Regan", "Regena", "Regenia", "Reggie", "Regina", "Reginald", "Regine", "Reginia", "Reid", "Reiko",
			"Reina", "Reinaldo", "Reita", "Rema", "Remedios", "Remona", "Rena", "Renae", "Renaldo", "Renata", "Renate", "Renato", "Renay", "Renda", "Rene",
			"Rene", "Renea", "Renee", "Renetta", "Renita", "Renna", "Ressie", "Reta", "Retha", "Retta", "Reuben", "Reva", "Rex", "Rey", "Reyes",
			"Reyna", "Reynalda", "Reynaldo", "Rhea", "Rheba", "Rhett", "Rhiannon", "Rhoda", "Rhona", "Rhonda", "Ria", "Ricarda", "Ricardo", "Rich", "Richard",
			"Richard", "Richelle", "Richie", "Rick", "Rickey", "Ricki", "Rickie", "Rickie", "Ricky", "Rico", "Rigoberto", "Rikki", "Riley", "Rima", "Rina",
			"Risa", "Rita", "Riva", "Rivka", "Rob", "Robbi", "Robbie", "Robbie", "Robbin", "Robby", "Robbyn", "Robena", "Robert", "Robert", "Roberta",
			"Roberto", "Roberto", "Robin", "Robin", "Robt", "Robyn", "Rocco", "Rochel", "Rochell", "Rochelle", "Rocio", "Rocky", "Rod", "Roderick", "Rodger",
			"Rodney", "Rodolfo", "Rodrick", "Rodrigo", "Rogelio", "Roger", "Roland", "Rolanda", "Rolande", "Rolando", "Rolf", "Rolland", "Roma", "Romaine", "Roman",
			"Romana", "Romelia", "Romeo", "Romona", "Ron", "Rona", "Ronald", "Ronald", "Ronda", "Roni", "Ronna", "Ronni", "Ronnie", "Ronnie", "Ronny",
			"Roosevelt", "Rory", "Rory", "Rosa", "Rosalba", "Rosalee", "Rosalia", "Rosalie", "Rosalina", "Rosalind", "Rosalinda", "Rosaline", "Rosalva", "Rosalyn", "Rosamaria",
			"Rosamond", "Rosana", "Rosann", "Rosanna", "Rosanne", "Rosaria", "Rosario", "Rosario", "Rosaura", "Roscoe", "Rose", "Roseann", "Roseanna", "Roseanne", "Roselee",
			"Roselia", "Roseline", "Rosella", "Roselle", "Roselyn", "Rosemarie", "Rosemary", "Rosena", "Rosenda", "Rosendo", "Rosetta", "Rosette", "Rosia", "Rosie", "Rosina",
			"Rosio", "Rosita", "Roslyn", "Ross", "Rossana", "Rossie", "Rosy", "Rowena", "Roxana", "Roxane", "Roxann", "Roxanna", "Roxanne", "Roxie", "Roxy",
			"Roy", "Roy", "Royal", "Royce", "Royce", "Rozanne", "Rozella", "Ruben", "Rubi", "Rubie", "Rubin", "Ruby", "Rubye", "Rudolf", "Rudolph",
			"Rudy", "Rudy", "Rueben", "Rufina", "Rufus", "Rupert", "Russ", "Russel", "Russell", "Russell", "Rusty", "Ruth", "Rutha", "Ruthann", "Ruthanne",
			"Ruthe", "Ruthie", "Ryan", "Ryan", "Ryann", "Sabina", "Sabine", "Sabra", "Sabrina", "Sacha", "Sachiko", "Sade", "Sadie", "Sadye", "Sage",
			"Sal", "Salena", "Salina", "Salley", "Sallie", "Sally", "Salome", "Salvador", "Salvatore", "Sam", "Sam", "Samantha", "Samara", "Samatha", "Samella",
			"Samira", "Sammie", "Sammie", "Sammy", "Sammy", "Samual", "Samuel", "Samuel", "Sana", "Sanda", "Sandee", "Sandi", "Sandie", "Sandra", "Sandy",
			"Sandy", "Sanford", "Sang", "Sang", "Sanjuana", "Sanjuanita", "Sanora", "Santa", "Santana", "Santiago", "Santina", "Santo", "Santos", "Santos", "Sara",
			"Sarah", "Sarai", "Saran", "Sari", "Sarina", "Sarita", "Sasha", "Saturnina", "Sau", "Saul", "Saundra", "Savanna", "Savannah", "Scarlet", "Scarlett",
			"Scot", "Scott", "Scott", "Scottie", "Scottie", "Scotty", "Sean", "Sean", "Season", "Sebastian", "Sebrina", "See", "Seema", "Selena", "Selene",
			"Selina", "Selma", "Sena", "Senaida", "September", "Serafina", "Serena", "Sergio", "Serina", "Serita", "Seth", "Setsuko", "Seymour", "Sha", "Shad",
			"Shae", "Shaina", "Shakia", "Shakira", "Shakita", "Shala", "Shalanda", "Shalon", "Shalonda", "Shameka", "Shamika", "Shan", "Shana", "Shanae", "Shanda",
			"Shandi", "Shandra", "Shane", "Shane", "Shaneka", "Shanel", "Shanell", "Shanelle", "Shani", "Shanice", "Shanika", "Shaniqua", "Shanita", "Shanna", "Shannan",
			"Shannon", "Shannon", "Shanon", "Shanta", "Shantae", "Shantay", "Shante", "Shantel", "Shantell", "Shantelle", "Shanti", "Shaquana", "Shaquita", "Shara", "Sharan",
			"Sharda", "Sharee", "Sharell", "Sharen", "Shari", "Sharice", "Sharie", "Sharika", "Sharilyn", "Sharita", "Sharla", "Sharleen", "Sharlene", "Sharmaine", "Sharolyn",
			"Sharon", "Sharonda", "Sharri", "Sharron", "Sharyl", "Sharyn", "Shasta", "Shaun", "Shaun", "Shauna", "Shaunda", "Shaunna", "Shaunta", "Shaunte", "Shavon",
			"Shavonda", "Shavonne", "Shawana", "Shawanda", "Shawanna", "Shawn", "Shawn", "Shawna", "Shawnda", "Shawnee", "Shawnna", "Shawnta", "Shay", "Shayla", "Shayna",
			"Shayne", "Shayne", "Shea", "Sheba", "Sheena", "Sheila", "Sheilah", "Shela", "Shelba", "Shelby", "Shelby", "Sheldon", "Shelia", "Shella", "Shelley",
			"Shelli", "Shellie", "Shelly", "Shelton", "Shemeka", "Shemika", "Shena", "Shenika", "Shenita", "Shenna", "Shera", "Sheree", "Sherell", "Sheri", "Sherice",
			"Sheridan", "Sherie", "Sherika", "Sherill", "Sherilyn", "Sherise", "Sherita", "Sherlene", "Sherley", "Sherly", "Sherlyn", "Sherman", "Sheron", "Sherrell", "Sherri",
			"Sherrie", "Sherril", "Sherrill", "Sherron", "Sherry", "Sherryl", "Sherwood", "Shery", "Sheryl", "Sheryll", "Shiela", "Shila", "Shiloh", "Shin", "Shira",
			"Shirely", "Shirl", "Shirlee", "Shirleen", "Shirlene", "Shirley", "Shirley", "Shirly", "Shizue", "Shizuko", "Shon", "Shona", "Shonda", "Shondra", "Shonna",
			"Shonta", "Shoshana", "Shu", "Shyla", "Sibyl", "Sid", "Sidney", "Sidney", "Sierra", "Signe", "Sigrid", "Silas", "Silva", "Silvana", "Silvia",
			"Sima", "Simon", "Simona", "Simone", "Simonne", "Sina", "Sindy", "Siobhan", "Sirena", "Siu", "Sixta", "Skye", "Slyvia", "So", "Socorro",
			"Sofia", "Soila", "Sol", "Sol", "Solange", "Soledad", "Solomon", "Somer", "Sommer", "Son", "Son", "Sona", "Sondra", "Song", "Sonia",
			"Sonja", "Sonny", "Sonya", "Soo", "Sook", "Soon", "Sophia", "Sophie", "Soraya", "Sparkle", "Spencer", "Spring", "Stacee", "Stacey", "Stacey",
			"Staci", "Stacia", "Stacie", "Stacy", "Stacy", "Stan", "Stanford", "Stanley", "Stanton", "Star", "Starla", "Starr", "Stasia", "Stefan", "Stefani",
			"Stefania", "Stefanie", "Stefany", "Steffanie", "Stella", "Stepanie", "Stephaine", "Stephan", "Stephane", "Stephani", "Stephania", "Stephanie", "Stephany", "Stephen", "Stephen",
			"Stephenie", "Stephine", "Stephnie", "Sterling", "Steve", "Steven", "Steven", "Stevie", "Stevie", "Stewart", "Stormy", "Stuart", "Su", "Suanne", "Sudie",
			"Sue", "Sueann", "Suellen", "Suk", "Sulema", "Sumiko", "Summer", "Sun", "Sunday", "Sung", "Sung", "Sunni", "Sunny", "Sunshine", "Susan",
			"Susana", "Susann", "Susanna", "Susannah", "Susanne", "Susie", "Susy", "Suzan", "Suzann", "Suzanna", "Suzanne", "Suzette", "Suzi", "Suzie", "Suzy",
			"Svetlana", "Sybil", "Syble", "Sydney", "Sydney", "Sylvester", "Sylvia", "Sylvie", "Synthia", "Syreeta", "Ta", "Tabatha", "Tabetha", "Tabitha", "Tad",
			"Tai", "Taina", "Taisha", "Tajuana", "Takako", "Takisha", "Talia", "Talisha", "Talitha", "Tam", "Tama", "Tamala", "Tamar", "Tamara", "Tamatha",
			"Tambra", "Tameika", "Tameka", "Tamekia", "Tamela", "Tamera", "Tamesha", "Tami", "Tamica", "Tamie", "Tamika", "Tamiko", "Tamisha", "Tammara", "Tammera",
			"Tammi", "Tammie", "Tammy", "Tamra", "Tana", "Tandra", "Tandy", "Taneka", "Tanesha", "Tangela", "Tania", "Tanika", "Tanisha", "Tanja", "Tanna",
			"Tanner", "Tanya", "Tara", "Tarah", "Taren", "Tari", "Tarra", "Tarsha", "Taryn", "Tasha", "Tashia", "Tashina", "Tasia", "Tatiana", "Tatum",
			"Tatyana", "Taunya", "Tawana", "Tawanda", "Tawanna", "Tawna", "Tawny", "Tawnya", "Taylor", "Taylor", "Tayna", "Ted", "Teddy", "Teena", "Tegan",
			"Teisha", "Telma", "Temeka", "Temika", "Tempie", "Temple", "Tena", "Tenesha", "Tenisha", "Tennie", "Tennille", "Teodora", "Teodoro", "Teofila", "Tequila",
			"Tera", "Tereasa", "Terence", "Teresa", "Terese", "Teresia", "Teresita", "Teressa", "Teri", "Terica", "Terina", "Terisa", "Terra", "Terrance", "Terrell",
			"Terrell", "Terrence", "Terresa", "Terri", "Terrie", "Terrilyn", "Terry", "Terry", "Tesha", "Tess", "Tessa", "Tessie", "Thad", "Thaddeus", "Thalia",
			"Thanh", "Thanh", "Thao", "Thea", "Theda", "Thelma", "Theo", "Theo", "Theodora", "Theodore", "Theola", "Theresa", "Therese", "Theresia", "Theressa",
			"Theron", "Thersa", "Thi", "Thomas", "Thomas", "Thomasena", "Thomasina", "Thomasine", "Thora", "Thresa", "Thu", "Thurman", "Thuy", "Tia", "Tiana",
			"Tianna", "Tiara", "Tien", "Tiera", "Tierra", "Tiesha", "Tifany", "Tiffaney", "Tiffani", "Tiffanie", "Tiffany", "Tiffiny", "Tijuana", "Tilda", "Tillie",
			"Tim", "Timika", "Timmy", "Timothy", "Timothy", "Tina", "Tinisha", "Tiny", "Tisa", "Tish", "Tisha", "Titus", "Tobi", "Tobias", "Tobie",
			"Toby", "Toby", "Toccara", "Tod", "Todd", "Toi", "Tom", "Tomas", "Tomasa", "Tomeka", "Tomi", "Tomika", "Tomiko", "Tommie", "Tommie",
			"Tommy", "Tommy", "Tommye", "Tomoko", "Tona", "Tonda", "Tonette", "Toney", "Toni", "Tonia", "Tonie", "Tonisha", "Tonita", "Tonja", "Tony",
			"Tony", "Tonya", "Tora", "Tori", "Torie", "Torri", "Torrie", "Tory", "Tory", "Tosha", "Toshia", "Toshiko", "Tova", "Towanda", "Toya",
			"Tracee", "Tracey", "Tracey", "Traci", "Tracie", "Tracy", "Tracy", "Tran", "Trang", "Travis", "Travis", "Treasa", "Treena", "Trena", "Trent",
			"Trenton", "Tresa", "Tressa", "Tressie", "Treva", "Trevor", "Trey", "Tricia", "Trina", "Trinh", "Trinidad", "Trinidad", "Trinity", "Trish", "Trisha",
			"Trista", "Tristan", "Tristan", "Troy", "Troy", "Trudi", "Trudie", "Trudy", "Trula", "Truman", "Tu", "Tuan", "Tula", "Tuyet", "Twana",
			"Twanda", "Twanna", "Twila", "Twyla", "Ty", "Tyesha", "Tyisha", "Tyler", "Tyler", "Tynisha", "Tyra", "Tyree", "Tyrell", "Tyron", "Tyrone",
			"Tyson", "Ula", "Ulrike", "Ulysses", "Un", "Una", "Ursula", "Usha", "Ute", "Vada", "Val", "Val", "Valarie", "Valda", "Valencia",
			"Valene", "Valentin", "Valentina", "Valentine", "Valentine", "Valeri", "Valeria", "Valerie", "Valery", "Vallie", "Valorie", "Valrie", "Van", "Van", "Vance",
			"Vanda", "Vanesa", "Vanessa", "Vanetta", "Vania", "Vanita", "Vanna", "Vannesa", "Vannessa", "Vashti", "Vasiliki", "Vaughn", "Veda", "Velda", "Velia",
			"Vella", "Velma", "Velva", "Velvet", "Vena", "Venessa", "Venetta", "Venice", "Venita", "Vennie", "Venus", "Veola", "Vera", "Verda", "Verdell",
			"Verdie", "Verena", "Vergie", "Verla", "Verlene", "Verlie", "Verline", "Vern", "Verna", "Vernell", "Vernetta", "Vernia", "Vernice", "Vernie", "Vernita",
			"Vernon", "Vernon", "Verona", "Veronica", "Veronika", "Veronique", "Versie", "Vertie", "Vesta", "Veta", "Vi", "Vicenta", "Vicente", "Vickey", "Vicki",
			"Vickie", "Vicky", "Victor", "Victor", "Victoria", "Victorina", "Vida", "Viki", "Vikki", "Vilma", "Vina", "Vince", "Vincent", "Vincenza", "Vincenzo",
			"Vinita", "Vinnie", "Viola", "Violet", "Violeta", "Violette", "Virgen", "Virgie", "Virgil", "Virgil", "Virgilio", "Virgina", "Virginia", "Vita", "Vito",
			"Viva", "Vivan", "Vivian", "Viviana", "Vivien", "Vivienne", "Von", "Voncile", "Vonda", "Vonnie", "Wade", "Wai", "Waldo", "Walker", "Wallace",
			"Wally", "Walter", "Walter", "Walton", "Waltraud", "Wan", "Wanda", "Waneta", "Wanetta", "Wanita", "Ward", "Warner", "Warren", "Wava", "Waylon",
			"Wayne", "Wei", "Weldon", "Wen", "Wendell", "Wendi", "Wendie", "Wendolyn", "Wendy", "Wenona", "Werner", "Wes", "Wesley", "Wesley", "Weston",
			"Whitley", "Whitney", "Whitney", "Wilber", "Wilbert", "Wilbur", "Wilburn", "Wilda", "Wiley", "Wilford", "Wilfred", "Wilfredo", "Wilhelmina", "Wilhemina", "Will",
			"Willa", "Willard", "Willena", "Willene", "Willetta", "Willette", "Willia", "William", "William", "Williams", "Willian", "Willie", "Willie", "Williemae", "Willis",
			"Willodean", "Willow", "Willy", "Wilma", "Wilmer", "Wilson", "Wilton", "Windy", "Winford", "Winfred", "Winifred", "Winnie", "Winnifred", "Winona", "Winston",
			"Winter", "Wm", "Wonda", "Woodrow", "Wyatt", "Wynell", "Wynona", "Xavier", "Xenia", "Xiao", "Xiomara", "Xochitl", "Xuan", "Yadira", "Yaeko",
			"Yael", "Yahaira", "Yajaira", "Yan", "Yang", "Yanira", "Yasmin", "Yasmine", "Yasuko", "Yee", "Yelena", "Yen", "Yer", "Yesenia", "Yessenia",
			"Yetta", "Yevette", "Yi", "Ying", "Yoko", "Yolanda", "Yolande", "Yolando", "Yolonda", "Yon", "Yong", "Yong", "Yoshie", "Yoshiko", "Youlanda",
			"Young", "Young", "Yu", "Yuette", "Yuk", "Yuki", "Yukiko", "Yuko", "Yulanda", "Yun", "Yung", "Yuonne", "Yuri", "Yuriko", "Yvette",
			"Yvone", "Yvonne", "Zachariah", "Zachary", "Zachery", "Zack", "Zackary", "Zada", "Zaida", "Zana", "Zandra", "Zane", "Zelda", "Zella", "Zelma",
			"Zena", "Zenaida", "Zenia", "Zenobia", "Zetta", "Zina", "Zita", "Zoe", "Zofia", "Zoila", "Zola", "Zona", "Zonia", "Zora", "Zoraida", "Zula", "Zulema", "Zulma"
		],

	chain_cache: {},
	namesets: {},

	/**
	 * Called from the page ready event
	 */
	init: function()
	{
		'use strict';

		// Display banner and log activity to the API console
		log(' _____             _____           _ ');
		log('| __  |_ _ ___ ___|   | |___ ___ _| |');
		log("|    -| | | .'|   | | | | -_|  _| . |");
		log('|__|__|_  |__,|_|_|_|___|___|_| |___|');
		log('      |___|                          ');
		log('-------------------------------------');
		log(' https://patreon.com/user?u=3985594  ');
		log('        Markov Name Generator        ');
		log('-------------------------------------');
		log('Markov default nameset loaded.');

		// Get any the user options
		var useroptions = (globalconfig && (globalconfig.Markov || globalconfig.markov)) || {searchHandouts: true};

		markov.namesets = {default: markov.defaultNames};
		// Because searching though handouts is an expensive process see if the user has opted out.
		if (useroptions.searchHandouts)
		{
			// Not the most efficient method, but due to asynchronous nature of handouts this is the only way
			var handouts = findObjs(
				{
					_type: "handout",
					archived: false
				});

			// Iterate through every single un-archived handout
			var handoutName;
			_.each(handouts, function (obj)
			{
				// Asynchronously get the gmnotes
				obj.get("gmnotes", function (gmnote)
				{
					// Does the gmnotes have 'markov' in them?
					if (gmnote === 'markov')
					{
						// Asynchronously get the notes which should have a comma separated list of names
						obj.get("notes", function (note)
						{
							handoutName = obj.get('name');
							markov.namesets[handoutName] = markov.listToArray(note, ',');
							log('Markov ' + handoutName + ' nameset loaded.');
						});
					}
				});
			});
		}

		// Hook into the chat events
		on("chat:message", markov.handleChatMessage);
	},

	/**
	 * Look to see if the chat message is a markov request, and if so generate a new name
	 *
	 * @param msg
	 */
	handleChatMessage: function(msg)
	{
		'use strict';

		// This an api directive?
		if (msg.type === "api")
		{
			// convert each word to an element into the words array.
			var words = markov.listToArray(msg.content, " ");
            //var playerName = msg.
			// Is this the !markov request?
			if (words[0] === '!markov')
			{
			    words = words.slice(1);
			    if(words.length > 0 && (words[0] === '-?' || words[0] === 'help'))
			    {
						markov.sendHelpText(msg);
			      return;
			    }
			    
			    var output = '';
			    if(words.length > 0 && words[0] === '-w')
			    { 
							var target = playerIsGM(msg.playerid)? 'gm' : '"' + msg.who + '"';
			        output += '/w "' + target + '" ';
							words = words.slice(1);
			    }
			    
			    var listToUse = ["default"];
			    if(words.length > 0)
					{
			        listToUse = words;
			    }
			    var names = listToUse.map(function(list)
					{
			        return markov.generateName(list).replace(/\s/g, '');
			    }).join(' ');
			    sendChat("", output + names);
			}
		}
	},

	/**
	 * Sends help text to the requester.
	 * 
	 * @param msg
	 */
	sendHelpText: function(msg)
	{
		var helpText = 
			'/w "' + msg.who + '" Markov usage:<br/>' +
			'<pre>' +
			'!markov [-? | help] | [-w] [nameset(s)]' +
			'</pre><br/>' +
			'All arguments are optional.<br/>' +
			' **-? or help**: whispers you this help text. Ignores any other arguments.<br/>' +
			' **-w**: whisper results<br/>' +
			'**nameset(s)**: any number of namesets, separated by spaces<br/><br/>' +
			'**Examples** <br/>' +
			markov.formatExamples([
				['!markov', 'This will generate a name from the default nameset and enter it to chat.'],
				['!markov -?', 'This will whisper this helpful content to you.'],
				['!markov help', 'Also whispers this help text to you.'],
				['!markov -w', 'This will generate a name from the default list and whisper it to you.'],
				['!markov setA setB', 'This will generate a name from setA and a name from setB and send them to chat.<br/><i>Useful if you have a nameset for first names and another for last names.</i>'],
				['!markov -w setA setB setC', 'This will generate a name from setA, setB, and setC and whisper them to you.']
			]);
			if(playerIsGM(msg.playerid))
			{
				helpText += '<br/><br/>For information on how to set up custom namesets, check out the '+
					'<a href="https://github.com/Roll20/roll20-api-scripts/blob/master/Markov/README.md" target="_blank" style="color:blue; text-decoration:underline">'+
					'README'+
					'</a>.';
			}
		sendChat('', helpText);
	},

	/**
	 * Produce HTML which properly formats the examples for the help text.
	 * 
	 * @param examples - Expected to be an array of tuples, where the first item is the command, and the second item is the description of output.
	 * @return string - The HTML string containing the examples.
	 */
	formatExamples: function(examples)
	{
			return '<ul>' + examples.map(function(example)
			{
					return  '<li><p>'+
									'<pre style="display:block;">' + example[0] + 
									'</pre><span style="display:block; padding-left:10px">' + example[1] + '</span>'+
									'</p></li>';
			}).join('') + '</ul>';  
	},
    
	/**
	 * Create a new name using Markov's logic
	 *
	 * @param languageName - will either be 'default', or the name of the handout that contains the nameset
	 * @return string - the new name, or a message indicating failure.
	 */
	generateName: function(languageName)
	{
		'use strict';
		if (!markov.namesets[languageName])
		{
			return 'Unknown Language (name-set) or handout notes are not valid: ' + languageName;
		}

		// Use markov's logic to generate a name using the names in languageName as a seed
		var chain = markov.markov_chain(languageName);
		if (chain)
		{
			return markov.markov_name(chain);
		}
		return '';
	},

	/**
	 * https://en.wikipedia.org/wiki/Markov_chain
	 *
	 * @param type
	 * @return {*}
	 */
	markov_chain: function(type)
	{
		'use strict';

		var chain = markov.chain_cache[type];

		if (chain)
		{
			return chain;
		}
		else
		{
			var list = markov.namesets[type];
			if (list)
			{
				chain = markov.construct_chain(list);
				if (chain)
				{
					markov.chain_cache[type] = chain;
					return chain;
				}
			}
		}
		return false;
	},

	/**
	 * https://en.wikipedia.org/wiki/Markov_chain
	 *
	 * @param list
	 * @return {*}
	 */
	construct_chain: function(list)
	{
		'use strict';

		var chain = {};

		for (var i = 0; i < list.length; i++)
		{
			var names = list[i].split(/\s+/);
			chain = markov.incr_chain(chain, 'parts', names.length);

			for (var j = 0; j < names.length; j++)
			{
				var name = names[j];
				chain= markov.incr_chain(chain, 'name_len', name.length);

				var c = name.substr(0, 1);
				chain = markov.incr_chain(chain, 'initial', c);

				var string = name.substr(1);
				var last_c = c;

				while (string.length > 0)
				{
					c = string.substr(0, 1);
					chain = markov.incr_chain(chain, last_c, c);

					string = string.substr(1);
					last_c = c;
				}
			}
		}
		return markov.scale_chain(chain);
	},

	/**
	 * https://en.wikipedia.org/wiki/Markov_chain
	 *
	 * @param chain
	 * @param key
	 * @param token
	 * @return {*}
	 */
	incr_chain: function(chain, key, token)
	  {
		  'use strict';

		if (chain[key])
		{
			if (chain[key][token])
			{
				chain[key][token]++;
			}
			else
			{
				chain[key][token] = 1;
			}
		}
		else
		{
			chain[key]= {};
			chain[key][token] = 1;
		}
		return chain;
	},

	/**
	 * https://en.wikipedia.org/wiki/Markov_chain
	 *
	 * @param chain
	 * @return {*}
	 */
	scale_chain: function(chain)
	{
		'use strict';

		var table_len = {};
		for (var key in chain)
		{
			table_len[key] = 0;

			for (var token in chain[key])
			{
				var count= chain[key][token];
				var weighted = Math.floor(Math.pow(count, 1.3));

				chain[key][token] = weighted;
				table_len[key] += weighted;
			}
		}
		chain.table_len = table_len;
		return chain;
	},

	/**
	 * https://en.wikipedia.org/wiki/Markov_chain
	 *
	 * @param chain
	 * @return {string}
	 */
	markov_name: function(chain)
	{
		'use strict';

		var parts = markov.select_link(chain, 'parts');
		var names = [];

		for (var i = 0; i < parts; i++)
		{
			var name_len = markov.select_link(chain, 'name_len');
			var c= markov.select_link(chain, 'initial');
			var name = c;
			var last_c= c;

			while (name.length < name_len)
			{
				c = markov.select_link(chain, last_c);
				name += c;
				last_c = c;
			}
			names.push(name);
		}
		return names.join(' ');
	},

	/**
	 * https://en.wikipedia.org/wiki/Markov_chain
	 *
	 * @param chain
	 * @param key
	 * @return {*}
	 */
	select_link: function(chain, key)
	{
		'use strict';

		var len = chain.table_len[key];
		var idx = Math.floor(Math.random() * len);

		var t = 0;
		for (var token in chain[key])
		{
			t += chain[key][token];
			if (idx < t)
			{
				return token;
			}
		}
		return '-';
	}
};

/**
 * Fire off init when the page loads.
 */
on("ready", function()
{
	'use strict';

	markov.init();
});
