export type GoogleReview = {
	id: string;
	author: string;
	rating: number;
	text: string;
	relativeTime: string;
};

export type PlaceReviewData = {
	rating: number;
	totalReviews: number;
	reviews: GoogleReview[];
};

export const googleReviewsData: PlaceReviewData = {
	rating: 5,
	totalReviews: 49,
	reviews: [
		{
			"id": "nicole-rosario",
			"author": "Nicole Rosario",
			"rating": 5,
			"text": "We had a wonderful experience working with Adriana. She was patient, knowledgeable, and always willing to show us homes until we found the right one. Her honest advice and dedication made the home-buying process much easier. We highly recommend her to anyone looking to buy a home!",
			"relativeTime": "hace 3 semanas"
		},
		{
			"id": "alejandro-z-alva",
			"author": "Alejandro Z Alva",
			"rating": 5,
			"text": "Adriana help us getting a house; she was super great; answered all our questions and very nice all the time. I would recommend her to anyone who is looking to buy a home.",
			"relativeTime": "hace 3 semanas"
		},
		{
			"id": "annie",
			"author": "Annie",
			"rating": 5,
			"text": "Adriana was very helpful in our process purchasing our first home. She was able to explain the whole process from start to finish. She kept in contact with us before we were ready to purchase the home. That made the difference and made us want her as our realtor. She is personable, knowledgeable and a family oriented person. Thank you Adriana for helping us find out first home.",
			"relativeTime": "hace 4 meses"
		},
		{
			"id": "itza-san",
			"author": "Itza San.",
			"rating": 5,
			"text": "Adriana was wonderful to work with! She’s friendly, knowledgeable, patient, and showed us several homes without ever making us feel rushed. We didn’t end up buying due to our own situation, but the experience with her was great. She’s also bilingual, which is a big plus. Highly recommend!",
			"relativeTime": "hace 5 meses"
		},
		{
			"id": "gina-valdez",
			"author": "Gina Valdez",
			"rating": 5,
			"text": "Vender mi casa era una decisión importante y un proceso que me generaba mucha ansiedad, pero trabajar con Adriana hizo toda la diferencia. Desde el primer día fue profesional, paciente y siempre estuvo disponible para resolver cada duda. Me acompañó paso a paso, me explicó todo con claridad y defendió mis intereses como si fueran los suyos y lo mas que me gusto que todo fue en español para que este proceso se haga fuera más fácil. Gracias a su dedicación, organización y experiencia, la venta fue rápida, segura y mucho más fácil de lo que imaginé. De verdad estoy muy agradecida por su apoyo y por haber hecho este proceso tan especial. Lo recomiendo al 100% a cualquier persona que esté buscando a alguien confiable, responsable y con un corazón genuino para ayudar. ¡Gracias por absolutamente todo!",
			"relativeTime": "hace 6 meses"
		},
		{
			"id": "cheryl-ann-shaw",
			"author": "Cheryl Ann Shaw",
			"rating": 5,
			"text": "Patient and extremely responsive but not pushy! Adriana was amazing throughout the whole experience and we absolutely love her. Thank you for helping us get into our dream home!",
			"relativeTime": "hace 10 meses"
		},
		{
			"id": "valentina-castano",
			"author": "Valentina Castano",
			"rating": 5,
			"text": "Mi esposo y yo estamos totalmente agradecidos con Adriana ya que nos complació y nos conoció perfectamente los gustos que nosotros queríamos para comprar la casa de nuestros sueños. Es una Agente totalmente dispuesta, siempre estuvo para nosotros a cualquier hora del día. Es muy pendiente, siempre nos daba los mejores consejos para tomar una decisión en cualquier casa que íbamos a ver, y no cometiéramos algún error por emoción. Mi esposo y yo la recomendamos a ojo cerrados, porque con nosotros superó las expectativas. Que incluso seguimos en contacto para cualquier duda que nosotros tengamos. Y lo mejor es que habla español y eso nos hizo sentir mucho más cómodos. Gracias Adriana por hacer real nuestra compra de nuestra casa 2024!!",
			"relativeTime": "hace 1 año"
		},
		{
			"id": "naiuska-toro",
			"author": "Naiuska Toro",
			"rating": 5,
			"text": "Adriana, is the best agent you could asked for. Very knowledgeable about the market in the area and just realty estate in general. She is super kind and very pleasant to work with. She cares and takes care of your home and your best...",
			"relativeTime": "hace 1 año"
		},
		{
			"id": "orlando-contreras",
			"author": "Orlando Contreras",
			"rating": 5,
			"text": "Es una persona muy atenta y disponible para cualquier duda, te ofrece diferentes tipos de alternativas muy profesional y muy amable es muy capaz y ayuda mucho en temas difíciles de entender o traducir de un lenguaje a otro. Cosas específicas ya que es completamente bilingüe; eso nos ayudó bastante para comprender mejor todos los procesos.",
			"relativeTime": "hace 2 meses"
		},
		{
			"id": "erasmo-fernandez",
			"author": "Erasmo Fernandez",
			"rating": 5,
			"text": "Hands off the best experience so far 100% recommended! Thanks Adriana for always being there for us!",
			"relativeTime": "hace 3 semanas"
		},
		{
			"id": "mila-o",
			"author": "Mila O",
			"rating": 5,
			"text": "She is the most knowledgeable. I was so grateful to have had her with me when buying my first home. Adriana negotiated for my best interests and made sure I was happy and satisfied with my choice before making my final decision. Even after the signing, she was very helpful and prompt with answering any questions I had. She truly is the best! 10/10",
			"relativeTime": "hace 2 años"
		},
		{
			"id": "dparlour-beautique",
			"author": "Dparlour Beautique",
			"rating": 5,
			"text": "Adrianna helped us so much with both the purchase of our home and the sale of the same property 4 years later. She was incredibly efficient and guided us through every step and negotiation. She truly listens and takes all of your needs into consideration. Thank you, Adrianna, for providing us with 5-star service. You’re the best!",
			"relativeTime": "hace 1 año"
		},
		{
			"id": "mildred-rodriguez-jaquez",
			"author": "Mildred Rodriguez-Jaquez",
			"rating": 5,
			"text": "Update for purchase on Nov 3, 2925: Adriana is a compassionate individual and a dedicated real estate agent. She is truly passionate about her work, and that passion motivates her to deliver exceptional service. Throughout the entire process, she was patient, attentive, and consistently offered thoughtful recommendations that helped me secure a rental property that met both my needs and my budget. She encouraged me to take my time and supported me every step of the way. Once we identified the ideal rental, the rest of the process was seamless. Adriana advocated on my behalf to ensure I received the best possible terms. Her extensive knowledge of the real estate market makes her an excellent resource for anyone seeking to purchase a home, secure a rental, or explore commercial properties. I highly recommend Adriana for her passion, dedication, expertise, and honesty. Adriana is an awesome person and real estate agent. She is very knowledgeable on the subject and makes the process seamless to the buyer and seller by doing all the hard work in the background. She wears your shoes by putting herself in your position as the buyer and understanding the challenges and complexity of buying your home. She is very human, honest, sincere and talented. To add a little bit more, she is bilingual making it easier to communicate whether is in English or Spanish. She makes the complex ride of buying as simple as it can be done. I am very satisfied with all the help she provided my family in obtaining our dream home and I will be forever grateful. She is and will continue to be my to go person for my next investment purchase. I highly recommend Adriana Melendez.",
			"relativeTime": "editado hace 7 meses"
		},
		{
			"id": "esmeralda-arevalo",
			"author": "Esmeralda Arevalo",
			"rating": 5,
			"text": "Decir gracias se nos hace muy poco!!!!... La verdad que es una bendición de encontrar personas como Adriana. A parte que es una gran profesional, es una persona tan humana que se siente esa conexión tan familiar. Desde que empezamos con el proceso de encontrar nuestra casa, ella siempre nos mantuvo agarrados de las manos, viendo lo mejor para mí familia. Ella es de esas personas profesionales que a pesar de que es su trabajo ella no ve por el bienestar de ella sino que por los demás. Muchísimas Gracias Adriana. Dios me la bendiga siempre a usted y a los suyos. ¡¡¡¡¡RECOMENDADA AL 10000%!!!!!",
			"relativeTime": "hace 2 años"
		},
		{
			"id": "john-leonard",
			"author": "John Leonard",
			"rating": 5,
			"text": "Adriana was a phenomenal agent. It was my first time buying a home and when I started the process my credit was not where it needed to be to get approved with a good rate with a VA loan. Adriana stuck with me and gave me advice and resources to help build my credit. As soon as my credit was good enough she put me in touch with a lender that was able to get me pre-approved. After that it was off to the races! Adriana not only showed me houses in the areas I was asking, she did her due diligence in finding homes that fit exactly what I was asking. She did not waste my time showing me houses she knew I would not be interested in and on top of that, she helped to make sure my children were in a good school district so that I would not have to worry about their future. Adriana is not just an agent that wants to see you a house, she's the agent that wants to sell you a home that you and your family will be happy living in for a very long time. If you are looking for an agent in the Virginia Beach area I highly recommend ending your search and calling Adriana Melendez. She is simply the best agent to have!",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "kate-cerpa",
			"author": "Kate Cerpa",
			"rating": 5,
			"text": "Tu profesionalismo, compromiso y calidez marcaron la diferencia en cada paso del camino. Gracias por acompañarnos en esta etapa tan importante de nuestras vidas. ¡Estamos felices con nuestro nuevo hogar y siempre te recordaremos con mucho cariño por ayudarnos a hacerlo realidad!!! 100% Recomendada 🌟🌟🌟🌟🌟",
			"relativeTime": "hace 1 año"
		},
		{
			"id": "claudette-medrano",
			"author": "Claudette Medrano",
			"rating": 5,
			"text": "Highly recommend Adriana, she has been amazing to work with. Highly responsive and available to see homes at the drop of a dime at any time of the day - she works with your schedule and makes it happen. She takes the time to understand your unique likes and preferences and makes sure to show homes that best fit those likes. Her fun and bubbly personality are just the cherry on the cake. Thank you for helping us get our first home!",
			"relativeTime": "hace 5 años"
		},
		{
			"id": "patricia-elena-mouthon",
			"author": "Patricia Elena Mouthon",
			"rating": 5,
			"text": "Adriana helps our family to buy the home we wanted in this crazy and wild market, we got the house we really like, she worked hard to write the best offer, she was and advocate, negotiator, a friend. The process was smooth, she always explained to us all our choices. She is a great agent to work with.",
			"relativeTime": "hace 4 años"
		},
		{
			"id": "grace-nance",
			"author": "Grace Nance",
			"rating": 5,
			"text": "Adriana es una gran real state! Ella nos acompañó durante el proceso de comprar nuestra casa paso a paso. Fue de gran ayuda porque habla español e inglés. Podía explicarle a mi esposo en inglés y a mi en español. Apreciamos mucho todo el trabajo que hizo por nosotros. 100% recomendada especialmente para la comunidad hispana. Adriana is a great real state! She assisted during the all process buying our house step by step. It was a huge help because she is bilingual. She explained every detail in English for my husband and clarified in Spanish for me. I really appreciate everything she did for us. 100% recommended.",
			"relativeTime": "hace 2 años"
		},
		{
			"id": "elsy-deleon",
			"author": "Elsy Deleon",
			"rating": 5,
			"text": "Desde que conocimos a Adriana existió una coneccion especial con Ella, es una Mujer con muchísimas características que la hacen ser profesional. Nuestra experiencia en el proceso de búsqueda de Casa fue LA MEJOR. Siempre estuvo desde el día 1 pendiente hasta del mínimo detalle, respondiendo cada duda y pregunta. Gracias por ser parte importante en este proceso tan importante para nuestra familia. 🏠 La recomendamos al mil por ciento, les aseguro no se arrepentirán. Dios bendiga siempre su trabajo y siga ayudando a cumplir esos sueños anhelados!",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "greenlife-fitness",
			"author": "Greenlife Fitness",
			"rating": 5,
			"text": "Adrianna nos acompañó con paciencia por dos años, siempre dándonos buenos consejos y guiándonos sin presión. Cuando encontramos la casa perfecta, cerramos en un mes. Gracias por estar con nosotros en todo el proceso!",
			"relativeTime": "hace 1 año"
		},
		{
			"id": "misael-dubon",
			"author": "Misael Dubon",
			"rating": 5,
			"text": "Sin duda la mejor experiencia trabajar de la mano de Adriana en la compra de nuestra primera casa. 100% la recomiendo, una de las mejores personas de Norfolk, Virginia.",
			"relativeTime": "hace 9 meses"
		},
		{
			"id": "joelizan-negron",
			"author": "Joelizan Negron",
			"rating": 5,
			"text": "La mejor Agente!!! Paciente, positiva, lista para conseguirte lo que estas buscando… muchas veces nos desanimábamos y ahí estaba ella super positiva diciéndonos q lo íbamos a lograr! Siempre busca las mejores alternativas y esta al pendiente q el hogar q vayas a comprar este en las mejores condiciones y en un buen lugar!!! Gracias a ella compramos una casa que es MUCHO MÁS de lo que imaginábamos, y por eso estamos mas que agradecidos. Si buscas alguien que te ayude a cumplir tu sueño, ADRIANA es la indicada.",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "sabrina-gomes",
			"author": "Sabrina Gomes",
			"rating": 5,
			"text": "Best realtor in the area, very attentive and professional. She helped me and my husband find our first house, we said what we wanted and she found exactly what we are looking for. She also helped us sell the property really quickly.",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "deborah-r-monroe",
			"author": "Deborah R. Monroe",
			"rating": 5,
			"text": "Adriana is great to work with. She does a great job with her clients and with her team. Great agent. Well recommended!",
			"relativeTime": "hace 4 años"
		},
		{
			"id": "milena-solorzano",
			"author": "Milena Solorzano",
			"rating": 5,
			"text": "Adriana Meléndez es una persona comprometida con su trabajo; estratégicamente hablando busca de todas las maneras habidas y por haber para que tus sueños se hagan realidad, siempre de la mano de Dios quien es su guía y le habré las puertas para que cada uno de sus clientes encuentren la casa adecuada.",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "lupita-zendejas",
			"author": "Lupita Zendejas",
			"rating": 5,
			"text": "Yo y mi familia estamos felices con nuestra nueva casa. Es la primera casa que compramos y fue una experiencia agradable; gracias a la ayuda y paciencia de Adriana encontramos la ideal. Estamos felices ❤️🙏🏼",
			"relativeTime": "hace 1 año"
		},
		{
			"id": "kevin-padilla",
			"author": "Kevin Padilla",
			"rating": 5,
			"text": "Contacte a Adriana para la compra de mi primera casa y sin duda alguna nos brindo el mejor servicio. En todo momento fue muy responsable y atenta, sin duda alguna la volvería a contactar. La recomiendo al 100%",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "astrid-flores",
			"author": "Astrid Flores",
			"rating": 5,
			"text": "Excellent. I recommend her with my eyes closed. Excellent professional and attentive to all the details and with her experience she helped me a lot to get my house.",
			"relativeTime": "hace 1 año"
		},
		{
			"id": "kwesi-braithwaite",
			"author": "Kwesi Braithwaite",
			"rating": 5,
			"text": "This is a millionaire real estate agent in the making. Just an all-around phenomenal person to work with. A true professional, in every sense of the word.",
			"relativeTime": "hace 2 años"
		},
		{
			"id": "israel-bonilla",
			"author": "Israel Bonilla",
			"rating": 5,
			"text": "Gracias por hacer el sueño de mi nuestra familia realidad al lograr que pudieramos comprar nuestro hogar. Resta decir que fuiste la indicada en nuestro proceso.",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "sil-b-b",
			"author": "Sil B.B.",
			"rating": 5,
			"text": "Great experience working with Adriana Melendez and her team. I recommend you a hard worker team with and amazing attitude and atmosphere.",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "vilmarie-rosario",
			"author": "Vilmarie Rosario",
			"rating": 5,
			"text": "Excelente Realtor, siempre está al pendiente de sus clientes, da su ayuda al máximo haciendo que el proceso sea más fácil y sencillo de entender.",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "lorena-rodriguez",
			"author": "Lorena Rodriguez",
			"rating": 5,
			"text": "La mejor, the best. Never would have done this without your super help and support. Estubistes en cada paso a cualquier hora siempre explicandome y guiandome. Gracias por ser la mejor, es un gran logro y es por ti.",
			"relativeTime": "hace 3 años"
		},
		{
			"id": "bessy-valladares",
			"author": "Bessy Valladares",
			"rating": 5,
			"text": "Agradecida al 100 con Adriana, mui buena en todo. Fue mui especial en la compra de nuestra 🏡",
			"relativeTime": "editado hace 9 meses"
		},
		{
			"id": "baldemar-izaguirre",
			"author": "Baldemar Izaguirre",
			"rating": 5,
			"text": "Atenta a todo, te informa de todo, te responde las llamadas al instante, toda la paciencia del mundo, simplemente la mejor.",
			"relativeTime": "hace 10 meses"
		},
		{
			"id": "emmanuel",
			"author": "Emmanuel",
			"rating": 5,
			"text": "Los mejores agente de compra y venta del 757",
			"relativeTime": "hace 3 años"
		},
	],
};
