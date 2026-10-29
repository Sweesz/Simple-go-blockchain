package main

import (
	"crypto/ed25519"
	"crypto/rand"
	"fmt"
	graph "main/Graph"
	bc "main/blockchain"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func main() {
	e := echo.New()
	myBlockchain := bc.New_blockchain()

	e.GET("/chain", func(c *echo.Context) error {
		for i := 1; i < len(myBlockchain.Chain); i++ {
			currBlock := myBlockchain.Chain[i]
			pBlock := myBlockchain.Chain[i - 1]
			if currBlock.PreviusHash != pBlock.Hash {
        		myBlockchain.Chain = myBlockchain.Chain[:len(myBlockchain.Chain)-1]
        		return c.JSON(http.StatusConflict, map[string]string{"error": "blockchain integrity check failed"})
    		}
		}
		return c.JSON(http.StatusOK, myBlockchain.Chain)
	})

	e.GET("/chain/:id", func(c *echo.Context) error {
		idStr, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return err
		}
		if idStr > len(myBlockchain.Chain) {
			return c.JSON(http.StatusNotFound, "Такого блока нет")
		}
		return c.JSON(http.StatusOK, myBlockchain.Chain[idStr])
	})

	e.POST("/add", func(c *echo.Context) error {
		var req graph.CreateTransaction

		if err := c.Bind(&req); err != nil {
       		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
    	}

		pubKey, privKey, _ := ed25519.GenerateKey(rand.Reader)

		dataToSign := fmt.Sprintf("%s%s%s%d", req.From, req.To, req.Data, req.Timestamp.Unix())

		signature := ed25519.Sign(privKey, []byte(dataToSign))

		tx := graph.Transaction{
        	From:   	 map[uuid.UUID]string{uuid.New(): req.From},
        	To:  		 map[uuid.UUID]string{uuid.New(): req.To},
        	Data:   	 req.Data,
        	Timestamp:   time.Now(),
			Signature: signature,
			PubKey: pubKey,
    	}

		prevBlock := myBlockchain.Chain[len(myBlockchain.Chain)-1]
		newBlock := bc.Block{
			Id:          len(myBlockchain.Chain),
			Hash:        bc.Generate_hash(),
			PreviusHash: prevBlock.Hash,
			Time:        time.Now(),
			Data:        []graph.Transaction{tx},
		}	

		myBlockchain.Chain = append(myBlockchain.Chain, newBlock)

		for i := 1; i < len(myBlockchain.Chain); i++ {
			currBlock := myBlockchain.Chain[i]
			pBlock := myBlockchain.Chain[i - 1]
			if currBlock.PreviusHash != pBlock.Hash {
        		myBlockchain.Chain = myBlockchain.Chain[:len(myBlockchain.Chain)-1]
        		return c.JSON(http.StatusConflict, "the blockchain is broken")
    		}
		}

		/*if len(myBlockchain.Chain) == 5 {
			remove(&myBlockchain.Chain, 3)
		}*/
		return c.JSON(http.StatusOK, myBlockchain.Chain)
	})

	e.Static("/static", "static")
	e.GET("/", func(c *echo.Context) error {
		return c.File("index.html")
	})
	
	e.Start(":8080")
}

func remove(slice *[]bc.Block, index int) []bc.Block {
    *slice = append((*slice)[:index], (*slice)[index+1:]...)
	return *slice
}