package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type MiniMaxRequest struct {
	Model     string    `json:"model"`
	Messages  []Message `json:"messages"`
	Temperature float64 `json:"temperature"`
	MaxTokens int       `json:"max_tokens"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type MiniMaxResponse struct {
	Choices []Choice `json:"choices"`
}

type Choice struct {
	Message Message `json:"message"`
}

// OptimizeWithAI 使用 MiniMax AI 优化简历
func OptimizeWithAI(content, optimType, target string) (string, error) {
	apiURL := os.Getenv("MINIMAX_API_URL")
	apiKey := os.Getenv("MINIMAX_API_KEY")

	if apiURL == "" {
		apiURL = "https://api.minimax.chat/v1/text/chatcompletion_v2"
	}

	if apiKey == "" {
		return "", fmt.Errorf("MINIMAX_API_KEY not set")
	}

	prompt := buildPrompt(content, optimType, target)

	requestBody := MiniMaxRequest{
		Model: "MiniMax-M2.5",
		Messages: []Message{
			{
				Role:    "system",
				Content: "你是一个专业的简历优化助手，擅长帮助程序员优化简历。你需要优化简历内容，使其更专业、更有吸引力。注意：1. 使用强有力的动词开头 2. 量化成果 3. 突出技术能力 4. 保持简洁专业",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Temperature: 0.7,
		MaxTokens:   4096,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API error: %s", string(body))
	}

	var result MiniMaxResponse
	err = json.Unmarshal(body, &result)
	if err != nil {
		return "", err
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("no response from AI")
	}

	return result.Choices[0].Message.Content, nil
}

func buildPrompt(content, optimType, target string) string {
	var prompt string

	switch optimType {
	case "translate":
		if target == "en" {
			prompt = "请将以下简历内容翻译成专业的英文简历，要求：\n1. 使用地道的英文表达\n2. 保留中文原文的专业术语\n3. 按照英文简历的格式习惯调整\n\n简历内容：\n" + content
		} else {
			prompt = "请将以下英文简历翻译成中文，要求：\n1. 使用专业的中文表达\n2. 保留技术术语的英文原词\n\n简历内容：\n" + content
		}
	case "keywords":
		prompt = "请分析以下简历，提取并补充可能遗漏的关键词（特别是技术关键词），这些关键词应该能帮助简历通过ATS系统。请列出需要添加的关键词，并说明原因。\n\n简历内容：\n" + content
	default: // improve
		prompt = "请优化以下简历，要求：\n1. 使用强有力的动词描述成就\n2. 量化工作成果（使用具体数字）\n3. 突出技术能力和业务价值\n4. 保持简洁专业\n5. 检查并修正语法错误\n\n简历内容：\n" + content
	}

	return prompt
}
