import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { SocialMediaCredentialsDto } from '../dto/social-media-credentials.dto';
import axios from 'axios';
import { SubredditDto } from '../dto/subreddit.dto';
import { SubredditService } from 'src/subreddit/services/subreddit.service';

interface RedditFlair {
  id: string;
  text: string;
  emojiUrl: string;
}

@Injectable()
export class RedditService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly subredditService: SubredditService,
  ) {}

  async connectReddit(
    user,
    socialMediaCredentialsDto: SocialMediaCredentialsDto,
  ): Promise<any> {
    const { username, password } = socialMediaCredentialsDto;
    // const clientId = process.env.REDDIT_CLIENT_ID;
    const clientId = 'Zr5-8QSd2Rk1uWgVZRRriw';
    // const clientSecret = process.env.REDDIT_SECRET;
    const clientSecret = 'G1BoL6D_lkVNol0kdnsMmefbJaAaMQ';
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    try {
      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        `grant_type=password&username=${username}&password=${password}`,
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      console.log(response.data);
      const accessToken = response.data.access_token;
      console.log(accessToken);
      // user.redditAccessToken = accessToken;
      // return await user.save();
    } catch (error) {
      console.error('CONNECT_REDDIT.', error);
    }
  }

  async fetchProfile(user: User) {
    try {
      const response = await axios.get('https://oauth.reddit.com/api/v1/me', {
        headers: {
          Authorization: `Bearer ${user.redditAccessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('FETCH_REDDIT_PROFILE.', error);
    }
  }

  async getSubreddits() {
    return await this.subredditService.getSubreddits();
  }

  async viewRedditKarma(user: User): Promise<{}> {
    const userr = await this.userModel.findById(user._id);

    if (!userr) {
      throw new Error('User not found');
    }

    try {
      const response = await axios.get(
        'https://oauth.reddit.com/api/v1/me/karma',
        {
          headers: {
            Authorization: `Bearer ${userr.redditAccessToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('FETCH_REDDIT_KARMA.', error);
    }
  }

  async createPostWithLink(
    user: User,
    sr: string,
    title: string,
    url: string,
  ): Promise<any> {

    const formData = new FormData();
    formData.append('sr', sr);
    formData.append('title', title);
    formData.append('url', url);
    formData.append('kind', 'link');
    formData.append('resubmit', 'true');
    const response = await axios.post(
      'https://oauth.reddit.com/api/submit',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.redditAccessToken}`,
        },
      },
    );
    const errors: string[] = [];
    let flag = false;
    for (const action of response.data.jquery) {
      if (Array.isArray(action)) {
        for (const element of action) {
          if (Array.isArray(element)) {
            for (const innerElement of element) {
              if (flag) {
                errors.push(innerElement);
                flag = false;
              } else if (
                innerElement.startsWith &&
                innerElement.startsWith('.error.')
              ) {
                flag = true;
              }
            }
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      ...(errors.length > 0 && { errors }),
    };
  }

  async createPostWithText(
    // user: User,
    sr: string,
    title: string,
    text: string,
    flair_id: string,
    flair_text: string,
  ): Promise<any> {

    const token =
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzE2MzYwNjU4LjYzNTQxNSwiaWF0IjoxNzE2Mjc0MjU4LjYzNTQxNCwianRpIjoiWnZpSHl5Y3ZnM2MwbHJRYTFaS3hoZF8yLWNhcDlnIiwiY2lkIjoiWnI1LThRU2QyUmsxdVdnVlpSUnJpdyIsImxpZCI6InQyXzEwdDNsc3p1YjEiLCJhaWQiOiJ0Ml8xMHQzbHN6dWIxIiwibGNhIjoxNzE2MjczMDY5OTI5LCJzY3AiOiJlSnlLVnRKU2lnVUVBQURfX3dOekFTYyIsImZsbyI6OX0.quydDVSrR_G8Pmj9xOouf1YHhRTvdqzFKHL4sE4j1n0T4HImxTkBuVlRsuKCPzz9uUO-LAUDkMiL96XxqO3aBvKDxfgARHR3S6WHNrSVCbt_v3xjDEoqZIUHzA8KSs4gNv4iLJj3m9plZcAeaQ4uG1igdly6RyvJyTme427pU2S1T1v40rm333oZXUZz0IZ7tGVOcZTl_elDkWDw1SLcMqj5JqaNaJoJQPLMIeLkr7AYh-ZKPP5uNEBGovd38qNxS2MR3Y9ZUmOCapHbYswCq3gd6FPCzcIxlFtHJSb9SKYA7YjY2OboHlQgd7Y0gclLoE9S96CTs3qKMNggFVlMVg';

    const formData = new FormData();
    formData.append('sr', sr);
    formData.append('title', title);
    formData.append('text', text);
    formData.append('kind', 'self');
    formData.append('resubmit', 'true');
    formData.append('flair_id', flair_id);
    formData.append('flair_text', flair_text);

    const response = await axios.post(
      'https://oauth.reddit.com/api/submit',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    try {
      const errors: string[] = [];
      let flag = false;
      for (const action of response.data.jquery) {
        if (Array.isArray(action)) {
          for (const element of action) {
            if (Array.isArray(element)) {
              for (const innerElement of element) {
                if (flag) {
                  errors.push(innerElement);
                  flag = false;
                } else if (
                  innerElement.startsWith &&
                  innerElement.startsWith('.error.')
                ) {
                  flag = true;
                }
              }
            }
          }
        }
      }

      return {
        success: errors.length === 0,
        ...(errors.length > 0 && { errors }),
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('An error occurred while creating the post.');
    }
  }

  async findFlairs(
    user: User,
    subredditDto: SubredditDto,
  ): Promise<RedditFlair[]> {
    const { name } = subredditDto;

    // const tokenObject = user.access_token.find((at) => {
    //   if (at.platform === 'reddit'){
    //     console.log(at);
    //   }
    // });

    const token =
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzE2MzYwNjU4LjYzNTQxNSwiaWF0IjoxNzE2Mjc0MjU4LjYzNTQxNCwianRpIjoiWnZpSHl5Y3ZnM2MwbHJRYTFaS3hoZF8yLWNhcDlnIiwiY2lkIjoiWnI1LThRU2QyUmsxdVdnVlpSUnJpdyIsImxpZCI6InQyXzEwdDNsc3p1YjEiLCJhaWQiOiJ0Ml8xMHQzbHN6dWIxIiwibGNhIjoxNzE2MjczMDY5OTI5LCJzY3AiOiJlSnlLVnRKU2lnVUVBQURfX3dOekFTYyIsImZsbyI6OX0.quydDVSrR_G8Pmj9xOouf1YHhRTvdqzFKHL4sE4j1n0T4HImxTkBuVlRsuKCPzz9uUO-LAUDkMiL96XxqO3aBvKDxfgARHR3S6WHNrSVCbt_v3xjDEoqZIUHzA8KSs4gNv4iLJj3m9plZcAeaQ4uG1igdly6RyvJyTme427pU2S1T1v40rm333oZXUZz0IZ7tGVOcZTl_elDkWDw1SLcMqj5JqaNaJoJQPLMIeLkr7AYh-ZKPP5uNEBGovd38qNxS2MR3Y9ZUmOCapHbYswCq3gd6FPCzcIxlFtHJSb9SKYA7YjY2OboHlQgd7Y0gclLoE9S96CTs3qKMNggFVlMVg';

    if (token) {
      try {
        const response = await axios.get(
          `https://oauth.reddit.com/r/${name}/api/link_flair_v2`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const flairs: RedditFlair[] = response.data.map((flair: any) => {
          // Emoji
          if (flair.richtext && flair.richtext.length > 0) {
            const richtext = flair.richtext[0];
            const emojiUrl = flair.richtext[1]?.u || '';
            const background_color = flair.background_color;
            // const text_color = flair.text_color;

            return {
              id: flair.id,
              text: richtext.t,
              emojiUrl: emojiUrl,
              background_color: background_color,
              text_color: flair.text_color,
            };
          } else {
            // No emoji
            return {
              id: flair.id,
              text: flair.text,
              emojiUrl: '',
              background_color: flair.background_color,
              text_color: flair.text_color,
            };
          }
        });

        return flairs;
      } catch (error) {
        console.error('FETCH_SUBREDDIT_FLAIRS.SUBREDDIT HAS NO FLAIRS');
      }
    }
  }

  async checkSubredditExists(subreddit: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/about.json`,
      );
      const data = await response.json();

      if (response.ok && data && data.kind === 't5') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('CHECK_SUBREDDIT_EXISTS.', error);
      return false;
    }
  }

  async deleteAccessToken(user: User): Promise<User> {
    const userr = await this.userModel.findById(user._id);

    if (!userr) {
      console.error('DELETE_REDDIT_TOKEN.USER_NOT_FOUND');
    }

    user.redditAccessToken = null;
    return await user.save();
  }
}
