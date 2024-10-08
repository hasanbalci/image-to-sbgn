import express from 'express';
import { config } from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

// Create a web server
const app = express();
const port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, "../public/")));
app.use(cors());

// Initialize OpenAI API
const openai = new OpenAI({
	apiKey: process.env.OPEN_API_KEY
});

// Define a route to handle gpt query
app.post('/gpt', async (req, res) => {
	let body = "";
	req.on('data', data => {
		body += data;
	});

	req.on('end', async () => {
		body = JSON.parse(body);

		let comment = body["comment"];
		let image = body["image"];
	
		let stylesheetImage = convertImage(path.join(__dirname, "assets/sbgn_stylesheet.png"));
		let firstSampleImage = convertImage(path.join(__dirname, "assets/Vitamins_B6_activation_to_pyridoxal_phosphate.png"));
		let secondSampleImage = convertImage(path.join(__dirname, "assets/Activated_STAT1alpha_induction_of_the_IRF1_gene.png"));

		let firstSampleSBGNML = convertSBGNML(path.join(__dirname, "assets/Vitamins_B6_activation_to_pyridoxal_phosphate.sbgn"));
		let secondSampleSBGNML = convertSBGNML(path.join(__dirname, "assets/Activated_STAT1alpha_induction_of_the_IRF1_gene.sbgn"));

		let userPrompt = "Now, based on what you have learned, generate the SBGNML for this hand-drawn SBGN diagram. Please note that macromolecule, simple cehmical, complex, nucleic acid feature, perturbing agent, unspecified entity, compartment, submap, empty set, phenotype, process, omitted process, uncertain process, association, dissociation, and, or, not nodes are represented with 'glyph' tag in SBGNML and consumption, production, modulation, simulation, catalysis, inhibition, necessary stimulation edges are represented with 'arc' tag in SBGNML. Make sure that each element in the graph has the correct tag, this is very inportant. Please also make sure that each glyph has a label and bbox subtags and each arc has source and target defined as attribute inside arc tag (not as subtags). Take your time and act with careful consideration. Do NOT enclose the JSON output in markdown code blocks like ```json and make sure that you are returning a valid JSON.";
		let userPromptWithComment = userPrompt;
		if(comment) {
			userPromptWithComment = userPrompt + " Additionally, please also consider the following comment during your process: " + comment;
		}
	
		let messagesArray = [
			{ role: 'system', content: 'You are a helpful and professional assistant for converting hand drawn biological networks drawn in Systems Biology Graphical Notation (SBGN) and producing the corresponding SBGNML files. You will be first given an image of a stylesheet that is used to draw biological networks in SBGN. Then for an input hand drawn biological network, you will analyze it and generate the corresponding SBGNML content. Please provide your final answer in JSON format. Do not return any answer outside of this format. A template looks like this: {"answer": "SBGNML content as a string"}. Do NOT enclose the JSON output in markdown code blocks like ```json and make sure that you are returning a valid JSON.'
			},
			{ 
				role: "user", 
				content: [
					{type: 'text', text: "Here is a stylesheet of SBGN shapes (nodes and edges) and their corresponding classes written in the right columns."}, 
					{type: 'image_url', image_url: {
            "url": stylesheetImage
          }}
				]
			},
			{ 
				role: "user", 
				content: [
					{type: 'text', text: userPrompt}, 
					{type: 'image_url', image_url: {
            "url": firstSampleImage
          }}
				]
			},
			{ 
				role: "assistant", 
				content: '{"answer": ' + firstSampleSBGNML + '}'
			},
			{ 
				role: "user", 
				content: [
					{type: 'text', text: userPrompt}, 
					{type: 'image_url', image_url: {
            "url": secondSampleImage 
          }}
				]
			},
			{ 
				role: "assistant", 
				content: '{"answer": ' + secondSampleSBGNML + '}'
			},
			{ 
				role: "user", 
				content: [
					{type: 'text', text: userPromptWithComment}, 
					{type: 'image_url', image_url: {
            "url": image
          }}
				]
			}
		];

		async function main() {
			const response = await openai.chat.completions.create({
				model: 'gpt-4o',
				messages: messagesArray
			});
			let answer = response.choices[0]["message"]["content"];
			console.log(answer);
			//return res.status(200).send(answer);
			return res.status(200).send(JSON.stringify(answer));
		}
		main();
	});
});

// Define a route to handle gpt query
app.post('/anno', async (req, res) => {
	let body = "";
	req.on('data', async (data) => {
		body += data;
	});

	req.on('end', async () => {
		let url = "http://grounding.indra.bio/ground_multi";
		const settings = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: body
		};

		let result = await fetch(url, settings)
		.then(response => response.json())
		.then(result => {
			return result;
		})
		.catch(e => {
			console.log("Error!");
		});
		return res.status(200).send(JSON.stringify(result, null, 2));
	});
});

const convertImage = (imgPath) => {
	// read image file
	let data = fs.readFileSync(imgPath);

	// convert image file to base64-encoded string
	const base64Image = Buffer.from(data, 'binary').toString('base64');

	// combine all strings
	const base64ImageStr = `data:image/png;base64,${base64Image}`;
	return base64ImageStr;
};

const convertSBGNML = (sbgnmlPath) => {
	// read sbgnml file
	let data = fs.readFileSync(sbgnmlPath);

	return data;
};

export { port, app }