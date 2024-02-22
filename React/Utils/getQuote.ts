import { requestUrl } from "obsidian";
import { QUOTE_SOURCE } from "src/Types/Enums";
import { CustomQuote } from "src/Types/Interfaces";

/**
 * Based on the configured quoteSource, gets a random quote from Quoteable, a custom quote, or both.
 * @param quoteSource
 * @param customQuotes
 */
const getQuote = async (
	quoteSource: QUOTE_SOURCE,
	customQuotes: CustomQuote[]
) => {
	let actualQuoteSource = quoteSource;
	let quote = {};

	// If set to both, pick one of the two at random
	if (quoteSource === QUOTE_SOURCE.BOTH) {
		actualQuoteSource = [QUOTE_SOURCE.QUOTEABLE, QUOTE_SOURCE.MY_QUOTES][
			Math.floor(Math.random() * 2)
		];
	}

	if (actualQuoteSource === QUOTE_SOURCE.QUOTEABLE) {
		quote = await requestUrl("https://api.quotable.io/random").then(
			async (res) => {
				if (res.status === 200) {
					return await res.json;
				}
			}
		);
	} else if (actualQuoteSource === QUOTE_SOURCE.MY_QUOTES) {
		const randomQuote =
			customQuotes[Math.floor(Math.random() * customQuotes.length)];
		quote = { content: randomQuote.text, author: randomQuote.author };
	}

	return quote;
};

export default getQuote;
