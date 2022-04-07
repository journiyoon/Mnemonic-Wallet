const express = require("express");
const router = express.Router();
const lightwallet = require("eth-lightwallet");
const fs = require("fs");

// Get Mnemonic code using lightwallet module
router.post("/newMnemonic", async (req, res) => {
	let mnemonic;
	try {
		mnemonic = lightwallet.keystore.generateRandomSeed();
		res.json({ mnemonic });
	} catch (err) {
		console.log(err);
		res.status(404).send({ message: "Bad Request" });
	}
});

// Create keystore and address using Mnemonic code and password
router.post("/newWallet", async (req, res) => {
	let password = req.body.password;
	let mnemonic = req.body.mnemonic;

	try {
		lightwallet.keystore.createVault(
			{
				password: password,
				seedPhrase: mnemonic,
				hdPathString: "m/0'/0'/0'",
			},
			function (err, ks) {
				ks.keyFromPassword(password, function (err, pwDerivedKey) {
					ks.generateNewAddress(pwDerivedKey, 1);

					let address = ks.getAddresses().toString();
					let keystore = ks.serialize();

					fs.writeFile("wallet.json", keystore, function (err, data) {
						if (err) {
							res.json({ code: 404, message: "Fail" });
						} else {
							res.json({ code: 204, message: "Success" });
						}
					});
				});
			}
		);
	} catch (exception) {
		console.log("NewWallet ==>>>> " + exception);
	}
});

module.exports = router;
