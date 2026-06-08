Qualtrics.SurveyEngine.addOnload(function() {

    const allPosts = [
        { id: 'clim_1', topic: 'clima', news: 1 },
        { id: 'clim_2', topic: 'clima', news: 1 }, 
        { id: 'clim_3', topic: 'clima', news: 2 },
        { id: 'clim_4', topic: 'clima', news: 2 },
        { id: 'clim_5', topic: 'clima', news: 2 },
        { id: 'clim_6', topic: 'clima', news: 3 },
        { id: 'clim_7', topic: 'clima', news: 4 },
        { id: 'clim_8', topic: 'clima', news: 5 },
        { id: 'imm_1', topic: 'immigració', news: 6 },
        { id: 'imm_2', topic: 'immigració', news: 6 },
        { id: 'imm_3', topic: 'immigració', news: 7 },
        { id: 'imm_4', topic: 'immigració', news: 7 },
        { id: 'imm_5', topic: 'immigració', news: 7 },
        { id: 'imm_6', topic: 'immigració', news: 7 },
        { id: 'imm_7', topic: 'immigració', news: 7 },
        { id: 'imm_8', topic: 'immigració', news: 8 },
        { id: 'imm_9', topic: 'immigració', news: 9 },
        { id: 'imm_10', topic: 'immigració', news: 10 },
        { id: 'imm_11', topic: 'immigració', news: 11 }, 
        { id: 'imm_12', topic: 'immigració', news: 12 },
        { id: 'imm_13', topic: 'immigració', news: 12 }
    ];

    let posts = allPosts.map(p => {
        let mides = (p.id === 'imm_11' || p.id === 'clim_2') ? [8, 16, 30] : [8, 16];
        return { id: p.id, topic: p.topic, news: p.news, lengths: mides };
    });

    function getRandomSample(array, size) {
        let shuffled = array.slice().sort(() => 0.5 - Math.random());
        return shuffled.slice(0, size);
    }

    let validSelection = false;
    let finalSelection = [];
    let attempts = 0;

    let posts30 = posts.filter(p => p.id === 'clim_2' || p.id === 'imm_11');
    let postsRest = posts.filter(p => p.news !== 1 && p.news !== 11);

    while(!validSelection && attempts < 1000) {
        attempts++;

        let shuffled30 = getRandomSample(posts30, 2);
        let real30 = { type: 'reals', id: shuffled30[0].id, topic: shuffled30[0].topic, length: 30, news: shuffled30[0].news };
        let fake30 = { type: 'ficticis', id: shuffled30[1].id, topic: shuffled30[1].topic, length: 30, news: shuffled30[1].news };

        let sampleRest = getRandomSample(postsRest, 4);

        let usedNews = new Set(sampleRest.map(p => p.news));
        if (usedNews.size !== 4) continue;

        let realTopics = [real30.topic, sampleRest[0].topic, sampleRest[1].topic];
        let fakeTopics = [fake30.topic, sampleRest[2].topic, sampleRest[3].topic];
        if (!realTopics.includes('clima') || !realTopics.includes('immigració')) continue;
        if (!fakeTopics.includes('clima') || !fakeTopics.includes('immigració')) continue;

        let sizesReal = [8, 16].sort(() => 0.5 - Math.random());
        let sizesFake = [8, 16].sort(() => 0.5 - Math.random());

        let realPosts = [
            real30,
            { type: 'reals', id: sampleRest[0].id, topic: sampleRest[0].topic, length: sizesReal[0], news: sampleRest[0].news },
            { type: 'reals', id: sampleRest[1].id, topic: sampleRest[1].topic, length: sizesReal[1], news: sampleRest[1].news }
        ];

        let fakePosts = [
            fake30,
            { type: 'ficticis', id: sampleRest[2].id, topic: sampleRest[2].topic, length: sizesFake[0], news: sampleRest[2].news },
            { type: 'ficticis', id: sampleRest[3].id, topic: sampleRest[3].topic, length: sizesFake[1], news: sampleRest[3].news }
        ];

        finalSelection = realPosts.concat(fakePosts);
        validSelection = true;
    }

    finalSelection.sort(() => 0.5 - Math.random());

    let baseUrl = "https://alexcasadevall.github.io/turing-test-what-if";

    finalSelection.forEach((post, index) => {
        let postNum = index + 1;

        let fileUrl = baseUrl + "/" + post.type + "/" + post.length + "/" + post.id + ".json";

        Qualtrics.SurveyEngine.setJSEmbeddedData("URL_Post_" + postNum, fileUrl);
        Qualtrics.SurveyEngine.setJSEmbeddedData("Categoria_" + postNum, post.type);
        Qualtrics.SurveyEngine.setJSEmbeddedData("Tema_" + postNum, post.topic);
        Qualtrics.SurveyEngine.setJSEmbeddedData("Mida_" + postNum, post.length);
        Qualtrics.SurveyEngine.setJSEmbeddedData("ID_" + postNum, post.id);
        Qualtrics.SurveyEngine.setJSEmbeddedData("Noticia_" + postNum, post.news); 
    });

    console.log("RANDOMISER DONE", finalSelection);
    console.log("URL_Post_1 set to:", Qualtrics.SurveyEngine.getJSEmbeddedData("URL_Post_1"));
});